from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sqlite import Item

ITEMS = [
    {"name": "First item", "description": "Added by the seed"},
    {"name": "Second item", "description": "Run `pnpm seed` again: nothing is duplicated"},
    {"name": "Third item", "description": None},
]


def seed(session: Session) -> int:
    """Add the demo items that are missing. Safe to run many times (matches by name)."""
    existing = set(session.scalars(select(Item.name)))
    new_items = [Item(**data) for data in ITEMS if data["name"] not in existing]
    session.add_all(new_items)
    session.commit()
    return len(new_items)
