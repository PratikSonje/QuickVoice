from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import (
    AgentSession,
    Agent,
    JobContext,
    LanguageCode,
    TurnHandlingOptions,
    inference,
    room_io,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from handlers.config_handler import get_config
from handlers.livekit_handler import get_transcripts, start_recording
from utils.logger import logger
import json
import asyncio
from datetime import datetime

load_dotenv(".env")


class Assistant(Agent):
    def __init__(self, system_prompt: str):
        super().__init__(instructions=system_prompt)


async def entrypoint(ctx: JobContext):
    logger.info(f"Entrypoint called with context: {ctx}")
    agent_number = None
    user_number = None
    agent_id = None
    # Try metadata first (outbound dispatch)
    metadata = ctx.job.metadata or ""
    logger.info(f"Metadata: {metadata}")
    if metadata:
        try:
            meta = json.loads(metadata)
            agent_id = meta.get("agent_id")
        except Exception:
            pass

    # Extract from SIP participants
    print("room name: ", ctx.room.name)
    agent_number = ctx.room.name.split("_")[0]
    user_number = ctx.room.name.split("_")[1]
    print("agent number: ", agent_number)
    print("user number: ", user_number)

    config = await get_config(agent_id)
    logger.info(f"Config: {config}")
    session = AgentSession(
        stt=inference.STT(
            model=config.get("stt_model", "deepgram/nova-3"),
            language=LanguageCode(config.get("agent_language", "en-US")),
        ),
        llm=inference.LLM(
            model=config.get("llm_model", "google/gemini-2.5-flash"),
            provider=config.get("llm_provider", "google"),
        ),
        tts=inference.TTS(
            model=config.get("tts_model", "deepgram/aura-2"),
            voice=config.get("voice", "athena"),
            language=LanguageCode(config.get("agent_language", "en-US")),
        ),
        vad=silero.VAD.load(),
        turn_handling=TurnHandlingOptions(turn_detection=MultilingualModel()),
        preemptive_generation=config.get("preemptive_generation", True),
    )
    agent = Assistant(
        system_prompt=config.get(
            "system_prompt",
            "You are a friendly, reliable voice assistant that answers questions, explains topics, and completes tasks with available tools.",
        )
    )
    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )
    call_start_time = datetime.now()
    recording_id = await start_recording(ctx)

    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        logger.info(f"[HANGUP] Participant disconnected: {participant.identity}")
        asyncio.create_task(unified_shutdown_hook(ctx))

    async def unified_shutdown_hook(shutdown_ctx: JobContext):
        duration = datetime.now() - call_start_time
        logger.info(f"Call duration: {duration}")
        transcript = get_transcripts(agent)
        logger.info(f"Transcript: {transcript}")
        logger.info(f"Recording ID: {recording_id}")
        


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(entrypoint_fnc=entrypoint, agent_name="QuickVoice")
    )
