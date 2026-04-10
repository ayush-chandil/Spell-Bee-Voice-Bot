const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Start a new game session
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} - { session_id, total_words }
 */
export async function startSession(difficulty) {
  try {
    const response = await fetch(`${API_URL}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: difficulty || 'medium'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Session started:', data);
    return data;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
}

/**
 * End a game session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Session end response
 */
export async function endSession(sessionId) {
  try {
    const response = await fetch(`${API_URL}/session/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Session ended:', data);
    return data;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

/**
 * Get the current state of a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Session state
 */
export async function getSessionState(sessionId) {
  try {
    const response = await fetch(`${API_URL}/session/${sessionId}/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Session state:', data);
    return data;
  } catch (error) {
    console.error('Error getting session state:', error);
    throw error;
  }
}

/**
 * Submit a spelling attempt
 * @param {string} sessionId - Session ID
 * @param {string} spelling - User's spelling attempt
 * @returns {Promise<Object>} - Evaluation response
 */
export async function submitSpelling(sessionId, spelling) {
  try {
    const response = await fetch(`${API_URL}/session/${sessionId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spelling: spelling
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Evaluation result:', data);
    return data;
  } catch (error) {
    console.error('Error submitting spelling:', error);
    throw error;
  }
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} - Server status
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}
