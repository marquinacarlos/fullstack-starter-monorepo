# Import every model here so Alembic autogenerate sees them through Base.metadata.
from app.models.item import Item

__all__ = ["Item"]
