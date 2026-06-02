"""
RAG retrieval: embed a query and fetch the top-k chunks from Pinecone
for the given agent namespace.
"""

import os
import asyncio
from loguru import logger


def _index():
    from pinecone import Pinecone  # type: ignore
    pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    return pc.Index(os.environ.get("PINECONE_INDEX", "quickvoice-kb"))


async def embed_query(query: str) -> list[float]:
    import google.generativeai as genai  # type: ignore
    genai.configure(api_key=os.environ.get("GOOGLE_EMBEDDING_API_KEY", os.environ.get("GOOGLE_API_KEY", "")))
    result = await asyncio.to_thread(
        genai.embed_content,
        model="models/text-embedding-004",
        content=query,
        task_type="retrieval_query",
    )
    emb = result["embedding"]
    # embed_content with a single string returns a flat list
    return emb if isinstance(emb[0], float) else emb[0]


async def get_rag_context(agent_id: str, query: str, top_k: int = 5) -> str:
    """
    Embed `query`, query Pinecone in the agent's namespace, and return
    the concatenated top-k chunk texts ready for injection into a system prompt.
    Returns an empty string if RAG is unavailable or yields no results.
    """
    try:
        vector = await embed_query(query)
        index = _index()
        resp = await asyncio.to_thread(
            index.query,
            vector=vector,
            top_k=top_k,
            namespace=agent_id,
            include_metadata=True,
        )
        matches = resp.get("matches", [])
        if not matches:
            return ""

        parts = []
        for m in matches:
            text = m.get("metadata", {}).get("text", "")
            name = m.get("metadata", {}).get("name", "")
            if text:
                parts.append(f"[{name}]\n{text}")

        return "\n\n---\n\n".join(parts)

    except Exception as exc:
        logger.warning(f"[rag] retrieval failed for agent={agent_id}: {exc}")
        return ""
