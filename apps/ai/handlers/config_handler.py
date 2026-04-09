async def get_config(agent_id: str):
    
    return {
        "agent_id": "123",
        "organization_id": "123",
        "first_message": "Hello, how can I help you today?",
        "system_prompt":"You are a friendly, reliable voice assistant that answers questions, explains topics, and completes tasks with available tools.",
        "agent_language":"en-US",
        "llm_model": "google/gemini-2.5-flash",
        "tts_model": "deepgram/aura-2",
        "use_rag":False,
        "voice": "athena",
        "data_needed":[],
        "data_extracted":[],
        "tools":[],
        "preemptive_generation": True,
    }