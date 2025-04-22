# backend/auth.py – FastAPI router pour Azure AD B2C + upsert SQLAlchemy

import os
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import httpx
from functools import lru_cache

# Imports SQLAlchemy
from backend.db.session import SessionLocal
from backend.db.models import User as UserModel
from sqlalchemy.exc import SQLAlchemyError

# ── Router et endpoints ─────────────────────────────────
router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # pas utilisé directement

# ── Config Azure B2C ───────────────────────────────────
TENANT_ID      = os.getenv("B2C_TENANT_ID")
POLICY         = os.getenv("B2C_POLICY", "B2C_1_signupsignin")
CLIENT_ID      = os.getenv("B2C_CLIENT_ID")              # SPA client id (pour /authorize, non utilisé ici)
BACKEND_APP_ID = os.getenv("B2C_BACKEND_APP_ID")         # AppID URI de l'API

# Issuer et endpoint OIDC
ISSUER = (
    f"https://{TENANT_ID}.b2clogin.com/"
    f"{TENANT_ID}.onmicrosoft.com/{POLICY}/v2.0"
)
OIDC_CONFIG_URL = f"{ISSUER}/.well-known/openid-configuration?p={POLICY}"

# ── Pydantic‑like User pour le reste de l’app ────────────
class User:
    def __init__(self, sub: str, email: Optional[str]):
        self.id = sub
        self.email = email

# ── Caching JWKS ────────────────────────────────────────
@lru_cache(maxsize=1)
def get_jwks():
    # 1) Charger la config OIDC
    cfg = httpx.get(OIDC_CONFIG_URL, timeout=10)
    if cfg.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Impossible de charger OIDC config: {cfg.status_code}")
    jwks_uri = cfg.json().get("jwks_uri")
    if not jwks_uri:
        raise HTTPException(status_code=500, detail="jwks_uri introuvable dans la config OIDC")
    # 2) Charger les clés
    keys = httpx.get(jwks_uri, timeout=10)
    if keys.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Impossible de charger JWKS: {keys.status_code}")
    return keys.json()

# ── Decode + verify JWT ─────────────────────────────────
def decode_verify(token: str):
    jwks = get_jwks().get("keys", [])
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    key = next((k for k in jwks if k.get("kid") == kid), None)
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Clé JWK introuvable")
    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=BACKEND_APP_ID,   # <--- on ne vérifie que l’audience de l’API
            issuer=ISSUER
        )
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return payload

# ── Dépendance DB pour session SQLAlchemy ───────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Debug endpoints ────────────────────────────────────
@router.get("/openid-config-url")
def openid_config():
    return {"url": OIDC_CONFIG_URL}

@router.get("/jwks-keys")
def jwks_keys():
    return get_jwks()

# ── Upsert + récupération de l'utilisateur ──────────────
async def current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[SessionLocal, Depends(get_db)]
):
    payload = decode_verify(token)
    sub   = payload.get("sub")
    email = payload.get("emails", [None])[0]
    try:
        user = db.query(UserModel).filter_by(id=sub).first()
        if not user:
            user = UserModel(id=sub, email=email)
            db.add(user)
        else:
            user.email = email
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur BDD lors de l'enregistrement de l'utilisateur")
    return User(sub, email)

@router.get("/me")
async def me(user: Annotated[User, Depends(current_user)]):
    return {"id": user.id, "email": user.email}
