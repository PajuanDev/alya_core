
# Alya Ultimate – Core Skeleton

**Created:** 2025-04-17

## Prérequis

* Docker Desktop (Windows)
* Git (pour cloner le dépôt)
* Une clé OpenAI + identifiants OAuth HubSpot/Trello/Slack/Gmail

## Démarrage local

```bash
# 1. Copier l'exemple d'environnement
cp .env.example .env  # puis renseigner vos clés

# 2. Lancer l'ensemble
docker compose up --build
```

- API Gateway: http://localhost:8000
- Frontend : http://localhost:5173

## Structure du projet

```
backend/     # FastAPI + Orchestrator + intégrations
frontend/    # React 18 + Vite
infra/       # docker-compose + fichiers IaC (plus tard)
```

---
Ce squelette contient uniquement la base permettant d'évoluer vers l'architecture « Alya Ultimate ». Les
intégrations HubSpot, Trello, Slack, Gmail sont stubées ; ajoutez vos clés et complétez la logique dans
`backend/integrations/`.
