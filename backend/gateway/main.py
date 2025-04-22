# backend/gateway/main.py

import uuid
import os
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

from backend.auth import router as auth_router, current_user, get_db, User as AuthUser
from backend.db.models import Conversation, Message

# ── Charger les variables d’environnement
load_dotenv()

# ── Configuration Azure OpenAI
endpoint    = os.getenv("AZURE_OPENAI_ENDPOINT")
deployment  = os.getenv("AZURE_OPENAI_DEPLOYMENT")
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-04-15-preview")

token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default",
)

client = AzureOpenAI(
    azure_endpoint          = endpoint,
    azure_ad_token_provider = token_provider,
    api_version             = api_version,
)

# ── Initialisation FastAPI
app = FastAPI(title="Alya Gateway")
app.include_router(auth_router)

# ── Schémas Pydantic
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    conversation_id: str
    reply: str

# ── Health check
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Chat avec mémoire contextuelle
@app.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    user: AuthUser  = Depends(current_user),
    db: Session     = Depends(get_db)
):
    # 1) Récupérer ou créer la conversation
    if req.conversation_id:
        conv = db.query(Conversation).filter_by(
            id=req.conversation_id, user_id=user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
    else:
        conv = Conversation(user_id=user.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2) Charger l’historique
    history = db.query(Message)\
                .filter_by(conversation_id=conv.id)\
                .order_by(Message.created_at)\
                .all()

    # 3) Construire le prompt
    openai_history = [
        {"role":"system","content":
         "Vous êtes Alya, un assistant proactif qui connaît tout l’historique."}
    ] + [
        {"role": m.role, "content": m.content} for m in history
    ] + [
        {"role":"user","content": req.message}
    ]

    # 4) Appel au modèle
    try:
        completion = client.chat.completions.create(
            model       = deployment,
            messages    = openai_history,
            max_tokens  = 800,
            temperature = 0.7,
        )
        reply = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5) Sauvegarder les échanges
    db.add_all([
        Message(conversation_id=conv.id, role="user",      content=req.message),
        Message(conversation_id=conv.id, role="assistant", content=reply),
    ])
    db.commit()

    # 6) Retour
    return ChatResponse(conversation_id=str(conv.id), reply=reply)
