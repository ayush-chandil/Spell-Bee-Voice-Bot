import logging
from enum import Enum

logger = logging.getLogger(__name__)


class GameTurn(Enum):
    """Represents the current game turn state."""

    WAITING_FOR_WORD = "waiting_for_word"
    BOT_SPEAKING = "bot_speaking"
    WAITING_FOR_SPELLING = "waiting_for_spelling"
    EVALUATING = "evaluating"
    COMPLETED = "completed"


class TurnManager:
    """
    Manages game turn-taking state.

    Tracks whose turn it is:
    - Bot speaks the word
    - User spells it back
    - Bot evaluates
    """

    def __init__(self):
        self.current_turn = GameTurn.WAITING_FOR_WORD
        self.bot_speaking = False
        self.user_input_received = False

    def start_bot_turn(self) -> None:
        """Mark bot as speaking."""
        self.current_turn = GameTurn.BOT_SPEAKING
        self.bot_speaking = True
        self.user_input_received = False
        logger.info("Bot turn started")

    def start_user_turn(self) -> None:
        """Mark it as user's turn to spell."""
        self.bot_speaking = False
        self.current_turn = GameTurn.WAITING_FOR_SPELLING
        logger.info("User turn started - waiting for spelling")

    def start_evaluation(self, user_input: str) -> None:
        """Mark evaluation phase."""
        self.user_input_received = True
        self.current_turn = GameTurn.EVALUATING
        logger.info(f"Evaluating user input: {user_input}")

    def complete(self) -> None:
        """Mark game as completed."""
        self.current_turn = GameTurn.COMPLETED
        logger.info("Game session completed")

    def get_current_turn(self) -> GameTurn:
        """Get the current turn state."""
        return self.current_turn

    def reset_turn(self) -> None:
        """Reset turn state for next word."""
        self.current_turn = GameTurn.WAITING_FOR_WORD
        self.bot_speaking = False
        self.user_input_received = False

    def interrupt_bot(self) -> None:
        """Handle interruption of bot speaking."""
        logger.info("Interrupting bot speaking")
        self.bot_speaking = False
        self.current_turn = GameTurn.WAITING_FOR_SPELLING

    def is_bot_speaking(self) -> bool:
        """Check if bot is currently speaking."""
        return self.bot_speaking

    def is_waiting_for_spelling(self) -> bool:
        """Check if waiting for user to spell."""
        return self.current_turn == GameTurn.WAITING_FOR_SPELLING
