from livekit import api
from utils.logger import logger
import os
from livekit.agents import JobContext
import uuid
def get_transcripts(agent):
    
    try:
        messages = agent.chat_ctx.messages
        logger.info(f"Messages: {messages}")
        if callable(messages):
            messages = messages()
        transcript = []
        logger.info(f"Messages: {messages}")
        for msg in messages:
            if getattr(msg, "role", None) in ("user", "assistant"):
                content = getattr(msg, "content", "")
                if isinstance(content, list):
                    content = " ".join(str(c) for c in content if isinstance(c, str))
                transcript.append({"role": msg.role, "content": content,"time": msg.created_at})
        logger.info(f"Transcript: {transcript}")
    except Exception as e:
        logger.error(f"[SHUTDOWN] Transcript read failed: {e}")
        transcript = []
    return transcript

async def start_recording(ctx: JobContext):
    # ── Recording → S3 Storage ─────────────────────────────────────
    egress_id = None
    recording_id=uuid.uuid4()
    try:
        rec_api = api.LiveKitAPI(
            url=os.environ["LIVEKIT_URL"],
            api_key=os.environ["LIVEKIT_API_KEY"],
            api_secret=os.environ["LIVEKIT_API_SECRET"],
        )
        egress_resp = await rec_api.egress.start_room_composite_egress(
            api.RoomCompositeEgressRequest(
                room_name=ctx.room.name,
                audio_only=True,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.OGG,
                        filepath=f"Voice-agents/Recordings/{recording_id}.ogg",
                        s3=api.S3Upload(
                            access_key=os.environ["ACCESS_KEY"],
                            secret=os.environ["SECRET_ACCESS_KEY"],
                            bucket="quickintell-rcm",
                            region=os.environ["REGION"],
                        ),
                    )
                ],
            )
        )
        egress_id = egress_resp.egress_id
        await rec_api.aclose()
        logger.info(f"[RECORDING] Started egress: {egress_id}")
        return recording_id
    except Exception as e:
        logger.warning(f"[RECORDING] Failed to start recording: {e}")
        return None