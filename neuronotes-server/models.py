# neuronotes-server/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
import json
from pydantic import BaseModel
from typing import List
from database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(Text, default="[]")  # stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    def get_tags(self):
        return json.loads(self.tags or "[]")  

class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []

    class Config:
        orm_mode = True

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)