from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import ChatRequest, ChatResponse, SourceChunk
from app.services.chat import answer_with_context
from app.services.retrieval import retrieve_relevant_chunks

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    hits = retrieve_relevant_chunks(
        db=db,
        query=payload.question,
        document_id=payload.document_id,
        limit=payload.top_k,
    )

    context = [item.content for item in hits]
    answer = answer_with_context(payload.question, context)

    sources = [
        SourceChunk(
            document_id=item.document_id,
            chunk_id=item.id,
            chunk_index=item.chunk_index,
            content=item.content,
        )
        for item in hits
    ]

    return ChatResponse(answer=answer, sources=sources)
