import random
from typing import List, Tuple

# 50 words across 3 difficulty levels
WORD_LIST = [
    # Easy words (20 words)
    "apple",
    "bat",
    "cat",
    "dog",
    "egg",
    "fish",
    "goat",
    "house",
    "ice",
    "jump",
    "kite",
    "lamp",
    "moon",
    "nose",
    "orange",
    "pig",
    "queen",
    "rain",
    "sun",
    "tree",
    # Medium words (15 words)
    "bicycle",
    "calendar",
    "dinosaur",
    "elephant",
    "favorite",
    "galaxy",
    "hospital",
    "imagination",
    "jeopardy",
    "keyboard",
    "library",
    "magazine",
    "natural",
    "opportunity",
    "pancake",
    # Hard words (15 words)
    "accomplished",
    "bibliography",
    "conscience",
    "dexterity",
    "embarrass",
    "fahrenheit",
    "guarantee",
    "hypothesis",
    "incomprehensible",
    "juxtaposition",
    "knowledge",
    "lieutenant",
    "magnificent",
    "necessary",
    "onomatopoeia",
]


def get_random_word(difficulty: str = "easy") -> str:
    """
    Get a random word from the word list based on difficulty.

    Args:
        difficulty: "easy", "medium", or "hard"

    Returns:
        A random word of the specified difficulty
    """
    from app.config import config

    if difficulty not in config.DIFFICULTY_LEVELS:
        difficulty = "easy"

    indices = config.DIFFICULTY_LEVELS[difficulty]
    return WORD_LIST[random.choice(indices)].lower()


def get_word_by_index(index: int) -> str:
    """Get a word by its index in the word list."""
    if 0 <= index < len(WORD_LIST):
        return WORD_LIST[index].lower()
    return ""


def get_all_words() -> List[str]:
    """Get all words in the list."""
    return [word.lower() for word in WORD_LIST]


def get_words_by_difficulty(difficulty: str) -> List[str]:
    """Get all words for a specific difficulty level."""
    from app.config import config

    if difficulty not in config.DIFFICULTY_LEVELS:
        return []

    indices = config.DIFFICULTY_LEVELS[difficulty]
    return [WORD_LIST[i].lower() for i in indices]
