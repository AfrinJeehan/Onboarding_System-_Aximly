from hashlib import sha256

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.buyer import Buyer
from app.repositories.buyer_repository import BuyerRepository
from app.schemas.buyer import BuyerCreate, BuyerLogin, BuyerUpdate


class BuyerService:
    def __init__(self) -> None:
        self.repository = BuyerRepository()

    def list_buyers(self, db: Session) -> list[Buyer]:
        return self.repository.list_all(db)

    def create_buyer(self, db: Session, payload: BuyerCreate) -> Buyer:
        normalized_email = payload.email.lower()
        if self.repository.get_by_email(db, normalized_email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A buyer with this email already exists.")

        buyer = Buyer(
            name=payload.name.strip(),
            email=normalized_email,
            phone=payload.phone.strip() if payload.phone else None,
            password_hash=self.hash_password(payload.password),
            company_name=payload.company_name.strip(),
            business_type=payload.business_type.strip(),
            address=payload.address.strip(),
            onboarding_goal=payload.onboarding_goal.strip(),
            status="pending",
            notification="Your account has been created and is pending admin review.",
        )

        try:
            self.repository.add(db, buyer)
            db.commit()
            db.refresh(buyer)
            return buyer
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to create buyer.") from exc

    def login_buyer(self, db: Session, payload: BuyerLogin) -> Buyer:
        buyer = self.repository.get_by_email(db, payload.email.lower())
        if not buyer or not buyer.password_hash:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid buyer credentials.")

        if buyer.password_hash != self.hash_password(payload.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid buyer credentials.")

        return buyer

    def get_buyer(self, db: Session, buyer_id: int) -> Buyer:
        buyer = self.repository.get_by_id(db, buyer_id)
        if not buyer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer not found.")
        return buyer

    def update_buyer(self, db: Session, buyer_id: int, payload: BuyerUpdate) -> Buyer:
        buyer = self.get_buyer(db, buyer_id)

        if payload.email:
            normalized_email = payload.email.lower()
            duplicate = self.repository.get_by_email(db, normalized_email)
            if duplicate and duplicate.id != buyer.id:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Another buyer already uses this email.")
            buyer.email = normalized_email

        if payload.name is not None:
            buyer.name = payload.name.strip()

        if payload.phone is not None:
            buyer.phone = payload.phone.strip() if payload.phone else None

        if payload.company_name is not None:
            buyer.company_name = payload.company_name.strip()

        if payload.business_type is not None:
            buyer.business_type = payload.business_type.strip()

        if payload.address is not None:
            buyer.address = payload.address.strip()

        if payload.onboarding_goal is not None:
            buyer.onboarding_goal = payload.onboarding_goal.strip()

        if payload.status is not None:
            buyer.status = payload.status.strip()

        if payload.notification is not None:
            buyer.notification = payload.notification.strip()

        if any(value is not None for value in [payload.name, payload.email, payload.phone, payload.company_name, payload.business_type, payload.address, payload.onboarding_goal]):
            buyer.notification = payload.notification or "Your profile was updated by admin."

        if payload.status is not None:
            if payload.status.strip().lower() == "approved":
                buyer.notification = "Your buyer account was approved by admin."
            else:
                buyer.notification = f"Your account status was changed to {payload.status.strip()}."

        try:
            db.commit()
            db.refresh(buyer)
            return buyer
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update buyer.") from exc

    def delete_buyer(self, db: Session, buyer_id: int) -> None:
        buyer = self.get_buyer(db, buyer_id)
        try:
            self.repository.delete(db, buyer)
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to delete buyer.") from exc

    def approve_buyer(self, db: Session, buyer_id: int) -> Buyer:
        buyer = self.get_buyer(db, buyer_id)
        buyer.status = "approved"
        buyer.notification = "Your buyer account has been approved by admin."

        try:
            db.commit()
            db.refresh(buyer)
            return buyer
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to approve buyer.") from exc

    @staticmethod
    def hash_password(password: str) -> str:
        return sha256(password.encode("utf-8")).hexdigest()
