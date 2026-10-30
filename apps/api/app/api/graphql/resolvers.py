from datetime import datetime

import strawberry
from sqlalchemy import select

from app.models.item import Item


@strawberry.type
class ItemType:
    id: int
    name: str
    description: str | None
    created_at: datetime


@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "ok"

    @strawberry.field
    def items(self, info: strawberry.Info) -> list[ItemType]:
        db = info.context["db"]
        rows = db.scalars(select(Item).order_by(Item.id))
        return [
            ItemType(id=r.id, name=r.name, description=r.description, created_at=r.created_at)
            for r in rows
        ]
