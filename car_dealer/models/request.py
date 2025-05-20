from sqlalchemy import Column, Integer, String
from models.database import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    contact = Column(String)
    message = Column(String, nullable=True)