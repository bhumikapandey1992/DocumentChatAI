from typing import List


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> List[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []

    words = cleaned.split(" ")
    chunks: list[str] = []

    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(words):
            break
        start = max(end - overlap, 0)

    return chunks
