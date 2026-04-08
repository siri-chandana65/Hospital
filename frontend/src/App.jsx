import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, UserPlus, Hospital, ArrowRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function Queue() {
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');

  const fetchQueue = async () => {
    try {
      const currentRes = await axios.get(`${API_BASE_URL}/current`);
      setCurrentToken(currentRes.data || null);

      const waitingRes = await axios.get(`${API_BASE_URL}/waiting`);
      setWaitingTokens(waitingRes.data || []);
    } catch (error) {
      console.error("Error fetching state:", error);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await axios.post(`${API_BASE_URL}/reset`);
      } catch (error) {
        console.error("Failed to reset queue:", error);
      }
      fetchQueue();
    };

    initApp();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateToken = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/token`);
      showNotification(`Token ${res.data.token_number} generated!`);
      fetchQueue();
    } catch (error) {
      showNotification("Error generating token");
    }
  };

  const callNextToken = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/next`);
      if (res.data.message) {
        showNotification("No more tokens waiting");
      } else {
        fetchQueue();
      }
    } catch (error) {
      showNotification("Error calling next token");
    }
  };

  const showNotification = (message) => {
    setAlertMsg(message);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div 
      className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative bg-cover bg-center"
      style={{ backgroundImage: `url('https://5.imimg.com/data5/SELLER/Default/2023/11/364363320/NV/NU/WR/64082820/smart-token-queue-management-software-for-clinics-500x500.png')` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gray-900/80  z-0"></div>

      <Link to="/" className="absolute top-6 left-6 text-gray-300 hover:text-white transition flex items-center gap-2 z-10">
        <span>← Back to Home</span>
      </Link>

      {alertMsg && (
        <div className="fixed top-6 bg-blue-600 px-6 py-3 rounded-full shadow-lg font-semibold z-50">
          {alertMsg}
        </div>
      )}

      <h1 className="text-4xl font-bold mb-10 tracking-wider drop-shadow-md z-10">Queue System</h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-xl relative z-10">
          <h2 className="text-xl text-gray-400 font-semibold mb-6 uppercase">Currently Serving</h2>
          <div className="w-56 h-56 bg-gray-900 border-4 border-green-500 rounded-full flex flex-col items-center justify-center mb-8 shadow-lg">
            <span className="text-sm text-green-500 font-bold tracking-widest mb-2">TOKEN</span>
            <span className="text-7xl font-bold text-green-400">
              {currentToken ? currentToken.token_number : '--'}
            </span>
          </div>
          <button onClick={callNextToken} className="w-full bg-green-600 hover:bg-green-500 transition-colors py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
            <Bell size={24} /> Call Next Token
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
             <h2 className="text-lg text-gray-400 font-semibold mb-4">Patient Entry</h2>
             <button onClick={generateToken} className="w-full bg-blue-600 hover:bg-blue-500 transition-colors py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
              <UserPlus size={24} /> Give New Token
            </button>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <h2 className="text-lg text-gray-400 font-semibold mb-4 border-b border-gray-700 pb-2">Waiting Queue ({waitingTokens.length})</h2>
            <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-2">
              {waitingTokens.length > 0 ? (
                waitingTokens.map((token) => (
                  <div key={token.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-gray-500">#{token.id}</span>
                    <span className="text-xl font-bold text-gray-200">Token {token.token_number}</span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-6">No tokens in queue.</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function Home() {
  return (
    <div 
      className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative bg-cover bg-center"
      style={{ backgroundImage: `url('https://media.istockphoto.com/id/1090425074/vector/vector-illustration-of-hospital-room-interior-with-medical-tools-bed-and-table-room-in.jpg?s=612x612&w=0&k=20&c=NrokSg7oN6vXB_wd75yyR3uYNoCNvqp6XfrxHR2l48A=')` }}
    >
      {/* Dark tint overlay so the text is still easy to read */}
      <div className="absolute inset-0 bg-gray-900/70  z-0"></div>

      <div className="max-w-2xl text-center flex flex-col items-center animate-fadeIn relative z-10">
        
        <div className="bg-blue-600 text-white p-6 rounded-full mb-8 shadow-xl shadow-blue-500/20">
          <Hospital size={64} />
        </div>
        
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Bellcorp Hospital</h1>
        
        <p className="text-xl text-gray-200 mb-12 leading-relaxed font-medium">
          Welcome to the advanced Patient Management System. Keep track of patient flows easily, fairly, and transparently.
        </p>
        
        <div className="flex gap-4">
          <Link 
            to="/queue" 
            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xl py-4 px-10 rounded-full flex items-center gap-3 transition-transform hover:scale-105 shadow-xl shadow-green-500/20"
          >
            Launch Queue Dashboard <ArrowRight size={24} />
          </Link>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* The Landing Page Route */}
        <Route path="/" element={<Home />} />
        
        {/* The Actual Application Route */}
        <Route path="/queue" element={<Queue />} />
      </Routes>
    </Router>
  );
}

export default App;