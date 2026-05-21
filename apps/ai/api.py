from fastapi import FastAPI

from handlers.config_handler import get_config


app = FastAPI(title="QuickVoice AI")


@app.get("/health")
async def health_check():
    return {"ok": True, "service": "ai"}


@app.get("/agents/{agent_id}/config")
async def read_agent_config(agent_id: str):
    return await get_config(agent_id)
