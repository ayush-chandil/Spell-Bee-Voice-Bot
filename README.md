# 🐝 Spell Bee Voice Bot

An interactive voice-based spelling game where a bot speaks a word and you spell it back letter by letter using your microphone. Built with a FastAPI backend and a React frontend.

---

## 📸 Screenshots

### Welcome Screen
![Welcome Screen](<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/79e8d664-6ce5-4f5a-a35c-3b7d724775c8" />)

### Game Board
![Game Board](<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/edb1bf16-b66c-443a-ae09-2279c1c9d43e" />)

### Results Screen
![Results Screen](<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9f4bdf1c-8d7a-42ab-841e-23fd2fac790b" />)

---

## ✨ Features

- 🎙️ **Voice Input** — Spell words letter by letter using your microphone (Web Speech API)
- 🤖 **Text-to-Speech** — Bot reads out each word using browser Speech Synthesis
- 📊 **Live Score Tracking** — Correct, incorrect, accuracy & progress updated in real time
- 🎯 **3 Difficulty Levels** — Easy, Medium, Hard word lists
- ⚡ **Real-time WebSocket** — Instant communication between frontend and backend
- 🏆 **Results Screen** — Final score, accuracy and full attempt history

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS |
| Backend   | Python 3.11, FastAPI, Uvicorn |
| Realtime  | WebSockets |
| Voice STT | Web Speech API (browser built-in) |
| Voice TTS | Web Speech Synthesis (browser built-in) |
| AI/NLP    | Pipecat AI, Groq, Deepgram (configured) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11
- Node.js 18+

---

### Backend Setup

```bash
cd backend

# Create virtual environment with Python 3.11
py -3.11 -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Add your DEEPGRAM_API_KEY and GROQ_API_KEY in .env

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🎮 How to Play

1. Open `http://localhost:5173` in **Chrome** (required for Web Speech API)
2. Select a difficulty — **Easy**, **Medium**, or **Hard**
3. Click **Start Game**
4. Listen to the bot say a word
5. Spell it back **letter by letter** out loud (e.g. say *"c a t"* for "cat")
6. Get instant feedback — correct or incorrect
7. Complete all 5 words to see your final score

> ⚠️ Allow microphone access when the browser asks

---

## 📁 Project Structure

```
Spell-Bee-Voice-Bot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + WebSocket endpoint
│   │   ├── bot.py               # Game logic & state management
│   │   ├── config.py            # Environment config
│   │   ├── words.py             # Word lists by difficulty
│   │   ├── pipeline.py          # Pipecat voice pipeline (optional)
│   │   └── processors/
│   │       ├── spelling_validator.py
│   │       └── turn_manager.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app + WebSocket + speech logic
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   ├── ScoreDisplay.jsx
│   │   │   ├── MicrophoneVisualizer.jsx
│   │   │   ├── ResultsScreen.jsx
│   │   │   └── GameHistory.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   └── utils/
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
│
└── screenshots/
```

---

## 🔑 Environment Variables

### Backend `.env`
```
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key
```

---

## 📝 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/start` | Start a new game session |
| GET | `/session/{id}/state` | Get current game state |
| POST | `/session/{id}/end` | End a session |
| WS | `/ws/{session_id}` | WebSocket for real-time game |
| GET | `/health` | Health check |

---

## 🙌 Credits

Built as part of the **CureLink Assignment** — Spell Bee Voice Bot challenge.
