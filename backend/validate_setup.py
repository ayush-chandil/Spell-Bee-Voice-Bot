#!/usr/bin/env python
"""
Validation script to check that the Spell Bee Bot backend is properly set up.
Run this after installation to verify everything is configured correctly.
"""

import sys
import os
from pathlib import Path


def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def print_check(status, message):
    """Print a check result."""
    symbol = "✓" if status else "✗"
    print(f"  {symbol} {message}")
    return status


def check_python_version():
    """Check Python version."""
    print_header("Python Version")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_check(True, f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_check(
            False,
            f"Python {version.major}.{version.minor} (need 3.8+)",
        )
        return False


def check_directory_structure():
    """Check project directory structure."""
    print_header("Directory Structure")
    base_path = Path(__file__).parent
    required_dirs = [
        "app",
        "app/processors",
        "tests",
    ]
    required_files = [
        "app/__init__.py",
        "app/bot.py",
        "app/config.py",
        "app/main.py",
        "app/pipeline.py",
        "app/words.py",
        "app/processors/__init__.py",
        "app/processors/spelling_validator.py",
        "app/processors/turn_manager.py",
        "tests/__init__.py",
        "tests/test_spelling_validator.py",
        "requirements.txt",
        ".env.example",
        "README.md",
    ]

    all_good = True
    for directory in required_dirs:
        path = base_path / directory
        status = path.exists() and path.is_dir()
        all_good &= print_check(status, f"Directory: {directory}")

    for file in required_files:
        path = base_path / file
        status = path.exists() and path.is_file()
        all_good &= print_check(status, f"File: {file}")

    return all_good


def check_dependencies():
    """Check if required packages are installed."""
    print_header("Required Dependencies")
    packages = [
        "pipecat",
        "fastapi",
        "uvicorn",
        "websockets",
        "pydantic",
        "dotenv",
    ]

    all_good = True
    for package in packages:
        try:
            __import__(package.replace("-", "_"))
            all_good &= print_check(True, f"Package: {package}")
        except ImportError:
            all_good &= print_check(False, f"Package: {package} (not installed)")

    return all_good


def check_environment_file():
    """Check environment configuration."""
    print_header("Environment Configuration")
    env_path = Path(__file__).parent / ".env"
    env_example_path = Path(__file__).parent / ".env.example"

    if env_path.exists():
        print_check(True, ".env file exists")
        # Check for API keys
        with open(env_path) as f:
            content = f.read()
            has_deepgram = (
                "DEEPGRAM_API_KEY" in content
                and "your_deepgram_api_key_here" not in content
            )
            has_groq = (
                "GROQ_API_KEY" in content
                and "your_groq_api_key_here" not in content
            )
            print_check(has_deepgram, "DEEPGRAM_API_KEY configured")
            print_check(has_groq, "GROQ_API_KEY configured")
            return has_deepgram and has_groq
    else:
        print_check(False, ".env file not found")
        if env_example_path.exists():
            print("  → Run: cp .env.example .env")
            print("  → Then update .env with your API keys")
        return False


def check_code_quality():
    """Check basic code quality."""
    print_header("Code Quality Checks")
    base_path = Path(__file__).parent

    # Check imports
    main_file = base_path / "app" / "main.py"
    if main_file.exists():
        with open(main_file) as f:
            content = f.read()
            has_fastapi = "from fastapi import FastAPI" in content
            has_websocket = "WebSocket" in content
            print_check(has_fastapi, "FastAPI properly imported")
            print_check(has_websocket, "WebSocket support present")

    bot_file = base_path / "app" / "bot.py"
    if bot_file.exists():
        with open(bot_file) as f:
            content = f.read()
            has_bot_class = "class SpellBeeBot" in content
            has_game_state = "class GameState" in content
            print_check(has_bot_class, "SpellBeeBot class defined")
            print_check(has_game_state, "GameState class defined")

    return True


def check_configuration_values():
    """Check configuration values."""
    print_header("Configuration Values")
    try:
        from app.config import config

        print_check(True, f"Config loaded")
        print_check(
            config.DEEPGRAM_API_KEY,
            "DEEPGRAM_API_KEY set",
        )
        print_check(config.GROQ_API_KEY, "GROQ_API_KEY set")
        print_check(
            True,
            f"Game max rounds: {config.MAX_ROUNDS}",
        )
        print_check(
            True,
            f"Points per correct: {config.POINTS_PER_CORRECT}",
        )
        return (
            config.DEEPGRAM_API_KEY and config.GROQ_API_KEY
        )
    except Exception as e:
        print_check(False, f"Error loading config: {e}")
        return False


def check_word_list():
    """Check word list."""
    print_header("Word List")
    try:
        from app.words import get_all_words, get_words_by_difficulty

        all_words = get_all_words()
        print_check(len(all_words) == 50, f"Word list has {len(all_words)} words")

        for difficulty in ["easy", "medium", "hard"]:
            words = get_words_by_difficulty(difficulty)
            print_check(
                len(words) > 0,
                f"{difficulty.capitalize()} words: {len(words)}",
            )

        return len(all_words) == 50
    except Exception as e:
        print_check(False, f"Error checking words: {e}")
        return False


def check_processors():
    """Check custom processors."""
    print_header("Custom Processors")
    try:
        from app.processors.spelling_validator import (
            SpellingValidator,
            SpellingResultFrame,
        )
        from app.processors.turn_manager import (
            TurnManager,
            GameTurn,
        )

        print_check(True, "SpellingValidator imported")
        print_check(True, "SpellingResultFrame imported")
        print_check(True, "TurnManager imported")
        print_check(True, "GameTurn imported")

        # Test SpellingValidator
        validator = SpellingValidator("apple")
        letters = validator._extract_letters("a p p l e")
        print_check(
            letters == ["a", "p", "p", "l", "e"],
            f"Spelling validation works: {letters}",
        )

        return True
    except Exception as e:
        print_check(False, f"Error checking processors: {e}")
        return False


def main():
    """Run all checks."""
    print("\n")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║    Spell Bee Voice Bot - Setup Validation Script         ║")
    print("╚═══════════════════════════════════════════════════════════╝")

    results = []

    # Run checks
    results.append(("Python Version", check_python_version()))
    results.append(("Directory Structure", check_directory_structure()))
    results.append(("Dependencies", check_dependencies()))
    results.append(("Environment File", check_environment_file()))
    results.append(("Code Quality", check_code_quality()))

    # Only check config if env is set
    try:
        results.append(("Configuration", check_configuration_values()))
    except Exception:
        print_header("Configuration Values")
        print_check(False, "Could not load configuration (check .env file)")
        results.append(("Configuration", False))

    results.append(("Word List", check_word_list()))
    results.append(("Custom Processors", check_processors()))

    # Summary
    print_header("Summary")
    total = len(results)
    passed = sum(1 for _, result in results if result)
    failed = total - passed

    for name, result in results:
        status = "PASS" if result else "FAIL"
        symbol = "✓" if result else "✗"
        print(f"  {symbol} {name}: {status}")

    print(f"\n  Total: {passed}/{total} checks passed")

    if failed == 0:
        print_header("Setup Complete!")
        print("  Your Spell Bee Voice Bot backend is ready to run.")
        print("\n  Next steps:")
        print("  1. Start the server:")
        print("     python -m uvicorn app.main:app --reload")
        print("\n  2. Visit the API docs:")
        print("     http://localhost:8000/docs")
        print("\n  3. Test an endpoint in the Swagger UI")
        print("")
        return 0
    else:
        print_header("Setup Issues Found")
        print(f"  {failed} check(s) failed. Please review the errors above.")
        print("\n  Common issues:")
        print("  • Missing .env file → cp .env.example .env")
        print("  • Missing API keys → Add to .env")
        print("  • Missing dependencies → pip install -r requirements.txt")
        print("")
        return 1


if __name__ == "__main__":
    sys.exit(main())
