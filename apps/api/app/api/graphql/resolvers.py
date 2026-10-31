from datetime import datetime  # scaffold:line items

import strawberry
from sqlalchemy import select  # scaffold:line items

from app.db.databases import sqlite_db  # scaffold:line items
from app.models.sqlite import Item  # scaffold:line items


# scaffold:begin items
@strawberry.type
class ItemType:
    id: int
    name: str
    description: str | None
    created_at: datetime


# scaffold:end items
@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "ok"

    # scaffold:begin items
    @strawberry.field
    def items(self) -> list[ItemType]:
        # The resolver opens its own session, so `health` never touches a database.
        with sqlite_db.session() as db:
            rows = list(db.scalars(select(Item).order_by(Item.id)))
        return [
            ItemType(id=r.id, name=r.name, description=r.description, created_at=r.created_at)
            for r in rows
        ]

    # scaffold:end items
