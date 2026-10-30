# Import every model of this database here so Alembic autogenerate sees them.
from app.models.sqlite.item import Item

__all__ = ["Item"]
