import os
from utils.logger import logger

_langfuse_client = None
_langfuse_initialized = False

def get_langfuse():
    global _langfuse_client, _langfuse_initialized
    
    if _langfuse_initialized:
        return _langfuse_client

    _langfuse_initialized = True
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")
    host = os.getenv("LANGFUSE_HOST")

    if public_key and secret_key and host:
        if not host.startswith("http"):
            logger.error("LANGFUSE_HOST must be a valid URL starting with http or https")
            return None

        try:
            from langfuse import Langfuse
            logger.info("Initializing Langfuse observability client")
            _langfuse_client = Langfuse(
                public_key=public_key,
                secret_key=secret_key,
                host=host
            )
        except ImportError:
            logger.error("Langfuse SDK is not installed. Run pip install langfuse")
    else:
        logger.info("Langfuse credentials not found. Observability disabled.")

    return _langfuse_client
