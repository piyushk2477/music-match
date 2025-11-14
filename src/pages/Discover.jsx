import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const Discover = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [sortOrder, setSortOrder] = useState('ASC'); // Default ascending

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get current user
        const userData = localStorage.getItem('user');
        let parsedUser = null;
        if (userData) {
          parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
        }

        // Fetch all users with their favorites, with sorting parameters
        const response = await fetch(`/api/users/all?sortBy=${sortBy}&sortOrder=${sortOrder}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Filter out current user
            const otherUsers = data.data.users.filter(user => user.userId !== parsedUser?.id);
            setUsers(otherUsers);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortBy, sortOrder]);

  const handleUserClick = (user) => {
    // Navigate to compare page with user data
    navigate('/compare', { state: { selectedUser: user, currentUser } });
  };

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

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if clicking the same sort option
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Change sort by and reset to ascending
      setSortBy(newSortBy);
      setSortOrder('ASC');
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-black text-white"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
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
      
      {/* Discover Content */}
      <div className="px-6 pb-6">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-6 text-white"
        >
          Discover People
        </motion.h1>
        
        {/* Sort Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <button
            onClick={() => handleSortChange('name')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              sortBy === 'name' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">Name</span>
            {sortBy === 'name' && (
              sortOrder === 'ASC' ? <FaSortUp /> : <FaSortDown />
            )}
          </button>
          
          <button
            onClick={() => handleSortChange('listening_minutes')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              sortBy === 'listening_minutes' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">Listening Minutes</span>
            {sortBy === 'listening_minutes' && (
              sortOrder === 'ASC' ? <FaSortUp /> : <FaSortDown />
            )}
          </button>
        </motion.div>
        
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No other users found.
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pt-10 gap-4 px-20"
          >
            {users.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleUserClick(user)}
                className="p-4 cursor-pointer transition-colors"
              >
                <div className={`w-30 h-30 rounded-2xl flex items-center justify-center text-[4rem] font-serif font-bold text-white mx-auto mb-3 opacity-95 ${getColorForUser(user.userName)}`}>
                  {getInitials(user.userName)}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold truncate">{user.userName}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Discover;