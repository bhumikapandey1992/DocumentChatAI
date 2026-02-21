import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core import UPLOAD_DIR
from app.db.models import Document, DocumentChunk
from app.db.database import get_db
from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.parser import UnsupportedFileTypeError, parse_document

router = APIRouter()
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")

    file_path = Path(UPLOAD_DIR) / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        text = parse_document(str(file_path))
    except UnsupportedFileTypeError as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Document has no parsable text")

    embeddings = embed_texts(chunks)

    document = Document(filename=file.filename, file_path=str(file_path))
    db.add(document)
    db.flush()

    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        db.add(
            DocumentChunk(
                document_id=document.id,
                chunk_index=idx,
                content=chunk,
                embedding=embedding,
            )
        )

    db.commit()

    return {
        "status": "success",
        "document_id": document.id,
        "filename": document.filename,
        "chunks_stored": len(chunks),
    }
