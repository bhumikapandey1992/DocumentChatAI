from openai import OpenAI

from app.core import OPENAI_API_KEY, OPENAI_CHAT_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def answer_with_context(question: str, context_chunks: list[str]) -> str:
    if not context_chunks:
        return "I don't know based on the selected document."

    context = "\n\n".join(context_chunks)
    system_prompt = (
        "You are a helpful assistant for question answering over uploaded documents. "
        "Only use the provided context. If the answer is not in the context, say you don't know."
    )

    response = client.chat.completions.create(
        model=OPENAI_CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
        temperature=0.1,
    )
    return response.choices[0].message.content or ""
