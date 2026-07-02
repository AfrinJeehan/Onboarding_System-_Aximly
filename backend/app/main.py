from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.buyers import router as buyers_router
from app.core.config import settings
from app.core.database import Base, ensure_buyer_schema, engine
from app.models.buyer import Buyer

app = FastAPI(title=settings.api_title, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(buyers_router)


@app.on_event("startup")
def on_startup() -> None:
    ensure_buyer_schema()
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
