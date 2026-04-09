# /src/app/utils/logger.py
import sys
from loguru import logger



# Remove default handler
logger.remove()

# Define custom log format
log_format = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>"
)

# Console sink (colored output)
logger.add(
    sys.stderr,
    level="INFO",
    format=log_format,
    colorize=True,
    backtrace=True,
    diagnose=True,
)



# Example usage
logger.info("Logger initialized successfully.")