# Import every model of this database here so Alembic autogenerate sees them.
from app.models.sqlite.item import Item  # scaffold:line items

__all__ = [
    "Item",  # scaffold:line items
]
