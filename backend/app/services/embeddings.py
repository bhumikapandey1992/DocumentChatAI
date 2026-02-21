from openai import OpenAI

from app.core import OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(model=OPENAI_EMBEDDING_MODEL, input=text)
    return response.data[0].embedding


def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=OPENAI_EMBEDDING_MODEL, input=texts)
    return [row.embedding for row in response.data]
