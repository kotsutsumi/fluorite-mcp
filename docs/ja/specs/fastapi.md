---
title: FastAPI エコシステム
---

# FastAPI エコシステム

- リソース URI: `spec://fastapi-ecosystem`

主な構成:
- 本体/サーバ: fastapi, uvicorn/hypercorn, gunicorn
- 認証: python-jose, passlib[bcrypt], authlib
- DB/ORM: sqlalchemy / sqlalchemy[asyncio], sqlmodel, databases, alembic
- バリデーション: pydantic (+ email 等)
- タスク: celery / dramatiq / arq
- キャッシュ/セッション: redis, aioredis, fastapi-cache2
- セキュリティ: fastapi-security, fastapi-cors, slowapi
- 観測/ロギング: structlog, loguru, sentry-sdk, prometheus-fastapi-instrumentator
- テスト: pytest, httpx, pytest-asyncio
- ドキュメント: fastapi[all], fastapi-utils
- デプロイ: docker, gunicorn+uvicorn, nginx

スターター:
- `spec://fastapi-starter`（SQLModel + Alembic + /healthz 最小構成）

実体は `src/catalog/fastapi-ecosystem.yaml` を参照。
