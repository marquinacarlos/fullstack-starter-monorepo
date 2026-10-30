from typing import Literal

from pydantic import BaseModel


class DatabaseStatus(BaseModel):
    name: str
    label: str
    status: Literal["connected", "disabled", "unavailable"]


class DatabasesResponse(BaseModel):
    databases: list[DatabaseStatus]
