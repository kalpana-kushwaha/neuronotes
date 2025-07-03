# neuronotes-server/main.py

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from transformers import pipeline
from keybert import KeyBERT
import json

from database import engine, get_session, Base
from models import Note, NoteCreate
from auth import router as auth_router

app = FastAPI()

# Register routers
app.include_router(auth_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB Tables
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def root():
    return {"message": "NeuroNotes API running!"}

# Notes CRUD

@app.post("/notes")
async def create_note(note: NoteCreate, db: AsyncSession = Depends(get_session)):
    new_note = Note(
        title=note.title,
        content=note.content,
        tags=json.dumps(note.tags),
        created_at=datetime.utcnow(),
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)
    return {
        "id": new_note.id,
        "title": new_note.title,
        "content": new_note.content,
        "tags": new_note.get_tags(),
        "created_at": new_note.created_at,
    }

@app.get("/notes")
async def get_notes(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note))
    notes = result.scalars().all()
    return [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "tags": note.get_tags(),
            "created_at": note.created_at,
        }
        for note in notes
    ]

@app.delete("/notes/{note_id}")
async def delete_note(note_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"message": "Note deleted"}

@app.put("/notes/{note_id}")
async def update_note(note_id: int, updated_note: NoteCreate, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.title = updated_note.title
    note.content = updated_note.content
    note.tags = json.dumps(updated_note.tags)
    await db.commit()
    await db.refresh(note)
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "tags": note.get_tags(),
        "created_at": note.created_at,
    }

# Summarize / Auto-tag
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
kw_model = KeyBERT()

@app.post("/summarize/{note_id}")
async def summarize_note(note_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    summary = summarizer(note.content, max_length=60, min_length=20, do_sample=False)[0]["summary_text"]
    return {"summary": summary}

@app.post("/tag/{note_id}")
async def auto_tag_note(note_id: int, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    tags = kw_model.extract_keywords(note.content, top_n=5)
    keywords = [kw[0] for kw in tags]
    note.tags = json.dumps(keywords)
    await db.commit()
    await db.refresh(note)
    return {"tags": keywords}

@app.get("/notes/search")
async def search_notes(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Note))
    notes = result.scalars().all()

    if not notes:
        return []

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    docs = [f"{n.title} {n.content}" for n in notes]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(docs)
    query_vec = vectorizer.transform([q])
    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    ranked_notes = sorted(zip(notes, cosine_similarities), key=lambda x: x[1], reverse=True)
    filtered_results = [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "tags": note.get_tags(),
            "created_at": note.created_at,
        }
        for note, score in ranked_notes if score > 0
    ]

    return filtered_results
