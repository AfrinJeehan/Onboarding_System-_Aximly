from sqlalchemy.orm import Session

from app.models.buyer import Buyer


class BuyerRepository:
    def list_all(self, db: Session) -> list[Buyer]:
        return db.query(Buyer).order_by(Buyer.created_at.desc(), Buyer.id.desc()).all()

    def get_by_id(self, db: Session, buyer_id: int) -> Buyer | None:
        return db.query(Buyer).filter(Buyer.id == buyer_id).first()

    def get_by_email(self, db: Session, email: str) -> Buyer | None:
        return db.query(Buyer).filter(Buyer.email == email).first()

    def add(self, db: Session, buyer: Buyer) -> Buyer:
        db.add(buyer)
        return buyer

    def delete(self, db: Session, buyer: Buyer) -> None:
        db.delete(buyer)
