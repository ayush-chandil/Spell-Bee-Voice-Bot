import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class SpellingResultFrame:
    """Result of a spelling validation attempt."""

    def __init__(self, is_correct: bool, target_word: str, spoken_text: str):
        self.is_correct = is_correct
        self.target_word = target_word
        self.spoken_text = spoken_text
        self.letters_spoken = self._extract_letters(spoken_text)

    def _extract_letters(self, text: str) -> list:
        """Extract individual letters from spoken text."""
        text = text.lower().strip()
        text = re.sub(r"[,\-\s]+", " ", text)
        letters = [char for char in text.split() if char and char.isalpha()]
        return letters


class SpellingValidator:
    """
    Validates spelling attempts from user input.

    Handles multiple input formats:
    - Space-separated: "a p p l e"
    - Hyphen-separated: "a-p-p-l-e"
    - Comma-separated: "a, p, p, l, e"
    """

    def __init__(self, target_word: str):
        self.target_word = target_word.lower().strip()
        self.user_input_buffer = ""
        self.validation_complete = False

    def validate(self, spoken_text: str) -> SpellingResultFrame:
        """
        Validate a spelling attempt against the target word.

        Args:
            spoken_text: The user's spoken spelling attempt

        Returns:
            SpellingResultFrame with validation result
        """
        user_letters = self._extract_letters(spoken_text)
        target_letters = list(self.target_word)
        is_correct = user_letters == target_letters

        logger.info(
            f"Spelling validation: target={self.target_word}, "
            f"user_input={spoken_text.strip()}, correct={is_correct}"
        )

        return SpellingResultFrame(
            is_correct=is_correct,
            target_word=self.target_word,
            spoken_text=spoken_text.strip(),
        )

    @staticmethod
    def _extract_letters(text: str) -> list:
        """
        Extract individual letters from spoken text.

        Handles patterns like:
        - "A B C" (space-separated)
        - "a-p-p-l-e" (hyphen-separated)
        - "a, p, p, l, e" (comma-separated)
        """
        text = text.lower().strip()

        # Remove common phrases
        phrases_to_remove = [
            "spell",
            "the word",
            "the spelling is",
            "its spelled",
            "it's spelled",
        ]
        for phrase in phrases_to_remove:
            text = text.replace(phrase, " ")

        # Replace common separators with spaces
        text = re.sub(r"[,\-/]+", " ", text)

        # Extract single letters and filter
        letters = []
        for part in text.split():
            if len(part) == 1 and part.isalpha():
                letters.append(part)

        return letters

    def reset(self, target_word: str) -> None:
        """Reset validator for a new word."""
        self.target_word = target_word.lower().strip()
        self.user_input_buffer = ""
        self.validation_complete = False
