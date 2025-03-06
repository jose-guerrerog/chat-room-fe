const API_URL = 'http://localhost:3001';

// Get all rooms
export async function getRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in getRooms:', error);
    // Return empty array as fallback
    return [];
  }
}

// Get a specific room
export async function getRoom(roomId) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }
  return response.json();
}

// Create a new room
export async function createRoom(name) {
  const response = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  return response.json();
}

// Get messages for a room
export async function getRoomMessages(roomId) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

// Send a message to a room
export async function sendMessage(roomId, content, sender_name) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, sender_name }),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
}
