import asyncio
import logging
from typing import Optional
from dataclasses import dataclass, asdict
from enum import Enum

from app.config import config
from app.words import get_random_word
from app.processors.spelling_validator import SpellingValidator, SpellingResultFrame
from app.processors.turn_manager import TurnManager, GameTurn

logger = logging.getLogger(__name__)


class GameDifficulty(Enum):
    """Game difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


@dataclass
class GameState:
    """Represents the current game state."""

    session_id: str
    current_round: int
    max_rounds: int
    score: int
    current_word: Optional[str] = None
    last_result: Optional[str] = None
    is_active: bool = True
    difficulty: str = "easy"

    def to_dict(self) -> dict:
        """Convert state to dictionary."""
        return asdict(self)


class SpellBeeBot:
    """
    Main bot class for Spell Bee game.

    Manages game state, word selection, and scoring.
    Voice pipeline (Pipecat) is optional and used only when available.
    """

    def __init__(self, session_id: str, difficulty: str = "easy"):
        self.session_id = session_id
        self.difficulty = difficulty
        self.state = GameState(
            session_id=session_id,
            current_round=0,
            max_rounds=config.MAX_ROUNDS,
            score=0,
            difficulty=difficulty,
        )

        # Initialize processors
        self.spelling_validator: Optional[SpellingValidator] = None
        self.turn_manager = TurnManager()

        logger.info(
            f"Initialized SpellBeeBot for session {session_id} with difficulty {difficulty}"
        )

    async def start_game(self) -> None:
        """Start a new game session."""
        logger.info(f"Starting game for session {self.session_id}")
        self.state.is_active = True
        self.state.current_round = 0
        self.state.score = 0
        await self.next_word()

    async def next_word(self) -> None:
        """
        Get the next word and prepare for the spelling round.
        """
        self.state.current_round += 1

        if self.state.current_round > self.state.max_rounds:
            await self.end_game()
            return

        # Get a random word for this difficulty
        self.state.current_word = get_random_word(self.difficulty)
        logger.info(
            f"Round {self.state.current_round}: Next word is '{self.state.current_word}'"
        )

        # Reset spelling validator for new word
        if self.spelling_validator:
            self.spelling_validator.reset(self.state.current_word)

        # Reset turn manager
        self.turn_manager.reset_turn()

        # Build the prompt for the bot to say
        if self.state.current_round == 1:
            prompt = (
                f"Welcome to Spell Bee! I'll say a word, and you spell it back letter by letter. "
                f"Here's your first word: {self.state.current_word}. Please spell it."
            )
        else:
            prompt = f"Next word: {self.state.current_word}. Please spell it."

        logger.info(f"Bot prompt: {prompt}")

    async def evaluate_answer(self, is_correct: bool) -> str:
        """
        Evaluate the user's spelling and provide feedback.

        Args:
            is_correct: Whether the spelling was correct

        Returns:
            Feedback message
        """
        if is_correct:
            self.state.score += config.POINTS_PER_CORRECT
            feedback = f"Correct! That's {config.POINTS_PER_CORRECT} points! Your score is now {self.state.score}."
            self.state.last_result = "correct"
            logger.info(f"Correct answer. Score: {self.state.score}")
        else:
            feedback = f"Incorrect. The correct spelling is {self.state.current_word}. Moving on..."
            self.state.last_result = "incorrect"
            logger.info(f"Incorrect answer. Expected: {self.state.current_word}")

        return feedback

    async def process_spelling_result(self, result: SpellingResultFrame) -> str:
        """Process spelling validation result."""
        feedback = await self.evaluate_answer(result.is_correct)
        return feedback

    async def end_game(self) -> None:
        """End the game session and show final score."""
        self.state.is_active = False
        logger.info(
            f"Game ended. Final score: {self.state.score}/{self.state.max_rounds * config.POINTS_PER_CORRECT}"
        )

    def get_state(self) -> dict:
        """Get current game state as dictionary."""
        return self.state.to_dict()

    def get_services(self) -> dict:
        """Get configured services (if pipecat is available)."""
        return {}
