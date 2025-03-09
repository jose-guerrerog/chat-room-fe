import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import RoomsList from './components/RoomsList';
import useUserStore from './store/userStore';
import './App.css';

function App() {

  const initializeUsername = useUserStore(state => state.initializeUsername);

  useEffect(() => {
    initializeUsername();
  }, [initializeUsername]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" />} />
          <Route path="/rooms" element={<RoomsList />} />
          <Route path="/rooms/:roomId" element={<ChatRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
