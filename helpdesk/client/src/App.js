import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';   // ← ADD THIS
import Home from './pages/Home';
import IssuePage from './pages/IssuePage';
import FeedbackPage from './pages/FeedbackPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<IssuePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </main>
        <Chatbot />   {/* ← ADD THIS */}
      </div>
    </Router>
  );
}

export default App;