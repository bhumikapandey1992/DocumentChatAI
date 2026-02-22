from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    document_id: int
    top_k: int = 5


class SourceChunk(BaseModel):
    document_id: int
    chunk_id: int
    chunk_index: int
    content: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
