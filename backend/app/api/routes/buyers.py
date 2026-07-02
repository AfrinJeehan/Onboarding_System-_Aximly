from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.buyer import BuyerCreate, BuyerLogin, BuyerRead, BuyerUpdate
from app.services.buyer_service import BuyerService

router = APIRouter()
service = BuyerService()


@router.post("/buyer", response_model=BuyerRead, status_code=status.HTTP_201_CREATED)
def create_buyer(payload: BuyerCreate, db: Session = Depends(get_db)):
    return service.create_buyer(db, payload)


@router.post("/buyer/login", response_model=BuyerRead)
def login_buyer(payload: BuyerLogin, db: Session = Depends(get_db)):
    return service.login_buyer(db, payload)


@router.get("/buyer/{buyer_id}", response_model=BuyerRead)
def get_buyer(buyer_id: int, db: Session = Depends(get_db)):
    return service.get_buyer(db, buyer_id)


@router.put("/buyer/{buyer_id}", response_model=BuyerRead)
def update_buyer(buyer_id: int, payload: BuyerUpdate, db: Session = Depends(get_db)):
    return service.update_buyer(db, buyer_id, payload)


@router.post("/buyer/{buyer_id}/approve", response_model=BuyerRead)
def approve_buyer(buyer_id: int, db: Session = Depends(get_db)):
    return service.approve_buyer(db, buyer_id)


@router.delete("/buyer/{buyer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_buyer(buyer_id: int, db: Session = Depends(get_db)):
    service.delete_buyer(db, buyer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/buyers", response_model=list[BuyerRead])
def list_buyers(db: Session = Depends(get_db)):
    return service.list_buyers(db)
