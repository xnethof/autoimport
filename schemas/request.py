from pydantic import BaseModel
from typing import Optional

class RequestBase(BaseModel):
    name: str
    contact: str
    message: Optional[str] = None

class RequestCreate(RequestBase):
    pass

class Request(RequestBase):
    id: int

    class Config:
        from_attributes = True