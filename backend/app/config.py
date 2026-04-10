import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration from environment variables."""

    # API Keys
    DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    DAILY_API_KEY = os.getenv("DAILY_API_KEY", "")

    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))

    # Game Configuration
    MAX_ROUNDS = 5
    POINTS_PER_CORRECT = 10

    # LLM Configuration
    LLM_MODEL = "llama-3.1-8b-instant"
    LLM_PROVIDER = "groq"

    # STT/TTS Configuration
    STT_PROVIDER = "deepgram"
    TTS_PROVIDER = "deepgram"
    STT_MODEL = "nova-2"
    TTS_MODEL = "aura-asteria-en"

    # Difficulty Levels
    DIFFICULTY_LEVELS = {
        "easy": list(range(0, 20)),
        "medium": list(range(20, 35)),
        "hard": list(range(35, 50)),
    }


config = Config()
