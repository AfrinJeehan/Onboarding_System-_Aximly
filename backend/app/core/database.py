from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_buyer_schema() -> None:
    inspector = inspect(engine)
    table_name = "buyers"

    if not inspector.has_table(table_name):
        Base.metadata.create_all(bind=engine)
        return

    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    required_columns = {
        "password_hash": "ALTER TABLE buyers ADD COLUMN password_hash VARCHAR(255)",
        "company_name": "ALTER TABLE buyers ADD COLUMN company_name VARCHAR(150)",
        "business_type": "ALTER TABLE buyers ADD COLUMN business_type VARCHAR(100)",
        "address": "ALTER TABLE buyers ADD COLUMN address VARCHAR(255)",
        "onboarding_goal": "ALTER TABLE buyers ADD COLUMN onboarding_goal TEXT",
        "notification": "ALTER TABLE buyers ADD COLUMN notification TEXT",
        "notification_seen_at": "ALTER TABLE buyers ADD COLUMN notification_seen_at TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, statement in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
