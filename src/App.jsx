import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import RoomsList from './components/RoomsList';
import './App.css';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    if (!username) {
      const defaultName = `User${Math.floor(Math.random() * 1000)}`;
      setUsername(defaultName);
      localStorage.setItem('username', defaultName);
    }
  }, [username]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" />} />
          <Route path="/rooms" element={<RoomsList username={username} setUsername={setUsername} />} />
          <Route path="/rooms/:roomId" element={<ChatRoom username={username} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
