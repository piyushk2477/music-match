import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaMusic, FaCompactDisc, FaClock } from 'react-icons/fa';

const Ranking = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Get current user
        const userData = localStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        // Fetch user similarity data (already sorted by similarity score descending)
        const response = await fetch('/api/user/similarity', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUsers(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getColorForUser = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    if (!name) return colors[0];
    
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-black text-white flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading rankings...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    >
      {/* Header with Back Button */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center p-6"
      >
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </motion.button>
      </motion.div>
      
      {/* Ranking Content */}
      <div className="px-6 pb-10">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-2 text-center"
        >
          Music Match Rankings
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-center mb-8"
        >
          Discover users with the most similar music taste
        </motion.p>
        
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-5xl mb-4"
              >
                
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2">No Rankings Available</h3>
              <p className="text-gray-500 max-w-md">
                There are no users with similar music taste yet. Add more favorite songs and artists to see rankings!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Leaderboard Section */}
            <div className="mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-center mb-12 text-white"
              >
                Top Music Matches
              </motion.h2>
              
              <div className="flex flex-col md:flex-row justify-center items-end gap-8 mb-16">
                {/* Second Place */}
                {users.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex flex-col items-center"
                  >
                    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl w-56 flex flex-col items-center p-5 relative overflow-visible border border-gray-600/50 shadow-xl">
                      {/* Rank Badge */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-white shadow-lg z-10">
                        #2
                      </div>
                      
                      {/* Profile Photo */}
                      <div className="mt-8 mb-5">
                        <div className={`w-24 h-24 rounded-full ${getColorForUser(users[1].userName)} flex items-center justify-center text-white font-bold text-3xl border-4 border-green-400 shadow-lg`}>
                          {getInitials(users[1].userName)}
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <h3 className="text-xl font-bold text-white mb-2 text-center w-full px-3 drop-shadow-lg">{users[1].userName}</h3>
                      <p className="text-gray-200 text-sm mb-1 drop-shadow">Match Score: {users[1].score}%</p>
                    </div>
                  </motion.div>
                )}
                
                {/* First Place */}
                {users.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative flex flex-col items-center"
                  >
                    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl w-64 flex flex-col items-center p-6 relative overflow-visible border border-gray-600/50 shadow-2xl">
                      {/* Rank Badge */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-2 border-white shadow-xl z-10">
                        #1
                      </div>
                      
                      {/* Profile Photo */}
                      <div className="mt-10 mb-5">
                        <div className={`w-32 h-32 rounded-full ${getColorForUser(users[0].userName)} flex items-center justify-center text-white font-bold text-4xl border-4 border-yellow-400 shadow-xl`}>
                          {getInitials(users[0].userName)}
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <h3 className="text-2xl font-bold text-white mb-2 text-center w-full px-3 drop-shadow-lg">{users[0].userName}</h3>
                      <p className="text-gray-200 mb-1 drop-shadow">Match Score: {users[0].score}%</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Third Place */}
                {users.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative flex flex-col items-center"
                  >
                    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl w-56 flex flex-col items-center p-5 relative overflow-visible border border-gray-600/50 shadow-xl">
                      {/* Rank Badge */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-white shadow-lg z-10">
                        #3
                      </div>
                      
                      {/* Profile Photo */}
                      <div className="mt-8 mb-5">
                        <div className={`w-24 h-24 rounded-full ${getColorForUser(users[2].userName)} flex items-center justify-center text-white font-bold text-3xl border-4 border-amber-600 shadow-lg`}>
                          {getInitials(users[2].userName)}
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <h3 className="text-xl font-bold text-white mb-2 text-center w-full px-3 drop-shadow-lg">{users[2].userName}</h3>
                      <p className="text-gray-200 text-sm mb-1 drop-shadow">Match Score: {users[2].score}%</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Remaining Users */}
            <div className="max-w-3xl mx-auto">
              {users.slice(3).map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-900 rounded-2xl p-4 mb-4 flex items-center"
                >
                  {/* Rank Number */}
                  <div className="flex items-center justify-center w-12 h-12 mr-4">
                    <span className="text-2xl font-bold text-gray-500">
                      #{index + 4}
                    </span>
                  </div>
                  
                  {/* User Profile */}
                  <div className="flex items-center flex-grow">
                    <div className={`w-12 h-12 rounded-full ${getColorForUser(user.userName)} flex items-center justify-center text-white font-bold mr-4`}>
                      {getInitials(user.userName)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{user.userName}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <FaClock className="mr-1" />
                        <span>{user.listeningMinutes || 0} min listened</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Similarity Score */}
                  <div className="flex items-center">
                    {user.score > 0 ? (
                      <>
                        <div className="w-24 bg-gray-700 rounded-full h-2.5 mr-3">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${user.score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-green-400">{user.score}%</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-500">0%</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Ranking;