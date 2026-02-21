from sqlalchemy.orm import Session

from app.db.models import DocumentChunk
from app.services.embeddings import embed_text


def retrieve_relevant_chunks(db: Session, query: str, limit: int = 5) -> list[DocumentChunk]:
    query_embedding = embed_text(query)

    rows = (
        db.query(DocumentChunk)
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .all()
    )
    return rows
