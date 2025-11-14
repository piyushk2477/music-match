import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Disable scrolling when component mounts
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center text-white"
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white p-6 relative overflow-hidden"
      style={{ 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Background gradient & blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-black to-gray-900 opacity-70 z-0"></div>
      <div className="absolute w-[600px] h-[600px] bg-green-500 blur-[160px] opacity-30 animate-pulse rounded-full -top-20 -left-20 z-0"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[160px] opacity-30 animate-pulse rounded-full bottom-10 right-10 z-0"></div>
      
      {/* Navbar with Music Match name at rightmost side */}
      <div className="fixed top-3 left-8 right-6 flex justify-between items-center z-50">
        <div className="text-3xl font-bold text-white pl-5">
          <img 
            src="/src/assets/music-match-logo1.png" 
            alt="Music Match Logo" 
            className="h-12 w-auto scale-175"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* User Profile Capsule */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/profile')}
            className="bg-gray-800 rounded-2xl py-3 mt-4 px-5 flex items-center space-x-3 cursor-pointer hover:bg-gray-700 transition-colors  border-[2px] border-gray-700 border-dashed"
          >
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl mr-5 font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[1.1rem]">{user.name}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10 pt-16 pb-32 overflow-hidden"
           style={{ overflow: 'hidden' }}>
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-3 text-white text-center tracking-wide font-serif"
        >
          Feel the Beat, Find Your Vibe
        </motion.h1>
        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-xl text-gray-300 max-w-3xl mx-auto text-center mb-8"
        >
          "Where melodies meet and souls connect through the universal language of music."
        </motion.p>
        
        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Discover People Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/discover')}
            className="bg-gray-900 rounded-3xl py-4 px-8 flex items-center justify-center space-x-4 cursor-pointer hover:bg-gray-800 transition-colors transform hover:scale-105 min-w-[200px] border-[1px] border-gray-700"
          >
            <div className="flex flex-col items-center">
              <span className="text-xl font-semibold">Discover People</span>
            </div>
            <div className="text-2xl">→</div>
          </motion.div>
          
          {/* View Ranking Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate('/ranking')}
            className="bg-gray-900 rounded-3xl py-4 px-8 flex items-center justify-center space-x-4 cursor-pointer hover:bg-gray-800 transition-colors transform hover:scale-104 min-w-[200px]  border-[1px] border-gray-700"
          >
            <div className="flex flex-col items-center">
              <span className="text-xl font-semibold">View Rankings</span>
            </div>
            <div className="text-2xl">→</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;