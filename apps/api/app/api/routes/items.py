from fastapi import APIRouter, status
from sqlalchemy import select

from app.api.deps import SqliteSession
from app.models.sqlite import Item
from app.schemas.item import ItemCreate, ItemRead

router = APIRouter(prefix="/api/items", tags=["rest"])


@router.get("", response_model=list[ItemRead])
def list_items(db: SqliteSession) -> list[Item]:
    return list(db.scalars(select(Item).order_by(Item.id)))


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: SqliteSession) -> Item:
    item = Item(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
