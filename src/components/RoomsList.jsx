import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';

// API URL pointing to Rails server
const API_URL = process.env.REACT_APP_RAILS_APP_URL;

function RoomsList() {
  const username = useUserStore(state => state.username);
  const setUsername = useUserStore(state => state.setUsername);
  const initializeUsername = useUserStore(state => state.initializeUsername);

  const [isUserLoading, setIsUserLoading] = useState(!username);

  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      initializeUsername();
      setIsUserLoading(false);
    } else {
      setIsUserLoading(false);
    }
  }, [username, initializeUsername]);
  
  useEffect(() => {
    fetchRooms();
    // Add dummy rooms for testing if API fails
    setRooms(prevRooms => {
      if (prevRooms.length === 0) {
        return [
          { id: 1, name: "General" },
          { id: 2, name: "Random" },
          { id: 3, name: "Tech Talk" }
        ];
      }
      return prevRooms;
    });
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/rooms`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoomName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      
      const newRoom = await response.json();
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    }
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };

  if (isLoading) {
    return <div className="loading">Loading rooms...</div>;
  }

  if (isLoading || isUserLoading) {
    return <div className="loading">Loading rooms...</div>;
  }

  return (
    <div className="rooms-container">
      <header className="rooms-header">
        <h1>Chat Rooms</h1>
        <div className="username-container">
          <label htmlFor="username">Your Name: </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your name"
          />
        </div>
      </header>
      
      {error && <div className="error">{error}</div>}
      
      <div className="create-room-container">
        <h2>Create New Room</h2>
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            required
          />
          <button type="submit" className="btn-primary">Create Room</button>
        </form>
      </div>
      
      <div className="rooms-list">
        <h2>Available Rooms</h2>
        {rooms.length === 0 ? (
          <p>No rooms available. Create one to get started!</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                <Link to={`/rooms/${room.id}`} className="room-link">
                  {room.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RoomsList;