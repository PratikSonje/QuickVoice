import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from handlers.config_handler import get_config
from handlers import kb_handler

app = FastAPI(title="QuickVoice AI")

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY", "")


def _verify_internal(request: Request) -> None:
    """Reject requests that don't carry the correct internal API key."""
    if INTERNAL_API_KEY and request.headers.get("x-internal-key") != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"ok": True, "service": "ai"}


# ── agent config ──────────────────────────────────────────────────────────────

@app.get("/agents/{agent_id}/config")
async def read_agent_config(agent_id: str):
    return await get_config(agent_id)


# ── KB processing ─────────────────────────────────────────────────────────────

class KbDocument(BaseModel):
    kbId: str
    name: str
    sourceType: str
    url: Optional[str] = None
    presignedUrl: Optional[str] = None
    originalFileName: Optional[str] = None


class KbProcessRequest(BaseModel):
    agentId: str
    organizationId: str
    documents: List[KbDocument]


@app.post("/kb/process")
async def process_kb(payload: KbProcessRequest, request: Request):
    _verify_internal(request)
    results = await kb_handler.process_documents(payload.model_dump())
    # Return 207 Multi-Status so the worker can inspect per-doc results
    return {"success": True, "processed": results}
