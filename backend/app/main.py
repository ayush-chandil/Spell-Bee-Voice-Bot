import asyncio
import logging
import uuid
from typing import Dict, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import config
from app.bot import SpellBeeBot, GameState
from app.processors.spelling_validator import SpellingResultFrame

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Spell Bee Voice Bot Backend",
    description="Interactive voice-based spelling game",
    version="1.0.0",
)

# Add CORS middleware for frontend on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for active game sessions
sessions: Dict[str, SpellBeeBot] = {}


# Pydantic models for request/response
class StartGameRequest(BaseModel):
    """Request model for starting a game."""

    difficulty: str = "easy"


class SessionResponse(BaseModel):
    """Response model for session operations."""

    session_id: str
    message: str
    state: Optional[dict] = None


class GameStateResponse(BaseModel):
    """Response model for game state."""

    session_id: str
    state: dict


class EvaluateAnswerRequest(BaseModel):
    """Request model for evaluating spelling answer."""

    is_correct: bool
    spoken_text: str


# REST API Endpoints


@app.post("/session/start", response_model=SessionResponse)
async def start_game(request: StartGameRequest) -> SessionResponse:
    """
    Start a new game session.

    Args:
        request: StartGameRequest with difficulty level

    Returns:
        Session ID and initial game state
    """
    session_id = str(uuid.uuid4())

    # Validate difficulty
    if request.difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty level")

    # Create and start bot
    bot = SpellBeeBot(session_id, difficulty=request.difficulty)
    await bot.start_game()

    # Store in sessions
    sessions[session_id] = bot

    logger.info(f"Started new game session: {session_id}")

    return SessionResponse(
        session_id=session_id,
        message=f"Game started! Difficulty: {request.difficulty}",
        state=bot.get_state(),
    )


@app.get("/session/{session_id}/state", response_model=GameStateResponse)
async def get_session_state(session_id: str) -> GameStateResponse:
    """
    Get current game state for a session.

    Args:
        session_id: Session ID

    Returns:
        Current game state
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    bot = sessions[session_id]
    return GameStateResponse(session_id=session_id, state=bot.get_state())


@app.post("/session/{session_id}/end", response_model=SessionResponse)
async def end_session(session_id: str) -> SessionResponse:
    """
    End a game session.

    Args:
        session_id: Session ID

    Returns:
        Confirmation message
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    bot = sessions[session_id]
    await bot.end_game()
    final_state = bot.get_state()

    # Clean up session
    del sessions[session_id]

    logger.info(
        f"Ended game session {session_id}. Final score: {final_state['score']}"
    )

    return SessionResponse(
        session_id=session_id,
        message="Game ended",
        state=final_state,
    )


@app.post("/session/{session_id}/next-word", response_model=SessionResponse)
async def next_word(session_id: str) -> SessionResponse:
    """
    Move to the next word in the game.

    Args:
        session_id: Session ID

    Returns:
        Next word and updated state
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    bot = sessions[session_id]

    # Check if game is still active
    current_state = bot.get_state()
    if not current_state["is_active"]:
        raise HTTPException(status_code=400, detail="Game session is not active")

    # Get next word
    await bot.next_word()
    updated_state = bot.get_state()

    logger.info(f"Advanced to next word in session {session_id}")

    return SessionResponse(
        session_id=session_id,
        message=f"Next word: {updated_state['current_word']}",
        state=updated_state,
    )


@app.post("/session/{session_id}/evaluate", response_model=SessionResponse)
async def evaluate_answer(
    session_id: str, request: EvaluateAnswerRequest
) -> SessionResponse:
    """
    Evaluate the user's spelling answer.

    Args:
        session_id: Session ID
        request: EvaluateAnswerRequest with spelling result

    Returns:
        Feedback and updated state
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    bot = sessions[session_id]
    feedback = await bot.evaluate_answer(request.is_correct)
    updated_state = bot.get_state()

    return SessionResponse(
        session_id=session_id,
        message=feedback,
        state=updated_state,
    )


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "active_sessions": len(sessions),
    }


# WebSocket endpoint for real-time communication
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str) -> None:
    """
    WebSocket endpoint for real-time voice/game communication.

    Protocol:
    - Client sends: {"type": "spell", "text": "a-p-p-l-e"}
    - Server responds: {"type": "result", "correct": true/false, "feedback": "..."}
    """
    # Verify session exists
    if session_id not in sessions:
        await websocket.close(code=4004, reason="Session not found")
        return

    await websocket.accept()
    bot = sessions[session_id]

    try:
        logger.info(f"WebSocket connected for session {session_id}")

        while True:
            # Receive message from client
            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "start_game":
                # Frontend signals game start — send back game_started only
                # (first word is included in game_started; no separate new_word needed)
                state = bot.get_state()
                await websocket.send_json(
                    {
                        "type": "game_started",
                        "data": {
                            "total_words": state["max_rounds"],
                            "difficulty": state["difficulty"],
                            "current_word": state["current_word"],
                        },
                    }
                )

            elif message_type == "end_game":
                # Frontend signals game end
                await bot.end_game()
                final_state = bot.get_state()
                await websocket.send_json(
                    {
                        "type": "game_over",
                        "data": {
                            "final_score": final_state["score"],
                            "total_words": final_state["max_rounds"],
                        },
                    }
                )

            elif message_type == "spell":
                # User spelling attempt
                spoken_text = data.get("text", "")
                target_word = bot.state.current_word

                if not target_word:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "No word in progress",
                        }
                    )
                    continue

                # Simple validation: check if letters match
                user_letters = [
                    c
                    for c in spoken_text.lower().split()
                    if c.isalpha() and len(c) == 1
                ]
                target_letters = list(target_word.lower())

                is_correct = user_letters == target_letters

                # Evaluate and get feedback
                feedback = await bot.evaluate_answer(is_correct)

                # Send result back
                await websocket.send_json(
                    {
                        "type": "result",
                        "correct": is_correct,
                        "feedback": feedback,
                        "target": target_word,
                        "state": bot.get_state(),
                    }
                )

            elif message_type == "next":
                # Request next word
                current_state = bot.get_state()
                if current_state["is_active"]:
                    await bot.next_word()
                    updated_state = bot.get_state()

                    # Check AFTER next_word() — it may have ended the game
                    if not updated_state["is_active"]:
                        await websocket.send_json(
                            {
                                "type": "game_over",
                                "data": {
                                    "final_score": updated_state["score"],
                                    "total_words": updated_state["max_rounds"],
                                },
                            }
                        )
                    else:
                        await websocket.send_json(
                            {
                                "type": "next_word",
                                "word": updated_state["current_word"],
                                "round": updated_state["current_round"],
                                "state": updated_state,
                            }
                        )
                else:
                    await websocket.send_json(
                        {
                            "type": "game_over",
                            "data": {
                                "final_score": current_state["score"],
                                "total_words": current_state["max_rounds"],
                            },
                        }
                    )

            elif message_type == "state":
                # Request current state
                await websocket.send_json(
                    {
                        "type": "state",
                        "state": bot.get_state(),
                    }
                )

            else:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": f"Unknown message type: {message_type}",
                    }
                )

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": str(e),
                }
            )
        except Exception:
            pass


# Application lifecycle
@app.on_event("startup")
async def startup_event() -> None:
    """Called when the application starts."""
    logger.info("Spell Bee Voice Bot Backend started")
    logger.info(f"Configuration: {config}")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Called when the application shuts down."""
    logger.info("Spell Bee Voice Bot Backend shutting down")
    logger.info(f"Active sessions: {len(sessions)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
        log_level="info",
    )
