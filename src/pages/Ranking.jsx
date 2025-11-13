import React, { useState, useEffect } from 'react';

const Ranking = ({ onBack, user }) => {
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarUsers = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
            const response = await fetch(`/api/user/similarity?userId=${user.id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar users');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          const rankedUsers = data.data.similarities.map((user, index) => ({
            ...user,
            rank: index + 1,
            score: Math.round(user.similarity * 100),
            image: `https://i.pravatar.cc/150?u=${user.userId}`
          }));
          setSimilarUsers(rankedUsers);
        }
      } catch (err) {
        console.error('Error fetching similar users:', err);
        setError(err.message || 'Failed to load similar users');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarUsers();
  }, [user]);

  const topUsers = similarUsers.slice(0, 3);
  const otherUsers = similarUsers.slice(3);

  return (
    <div className="min-h-screen from-black via-gray-900 to-gray-800 text-white px-6 py-10">
      <button
        onClick={() => onBack("home")}
        className="mb-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-semibold"
      >
        ← Back to Home
      </button>

      <h1 className="text-4xl font-extrabold text-center mb-4 text-green-400">
        🎵 Your Music Matches
      </h1>
      <p className="text-center text-gray-400 mb-12">
        Discover users with similar music taste
      </p>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Finding your music matches...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : similarUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No similar users found yet. Add more favorite songs to find matches!</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-10 mb-16">
            {topUsers.map((user) => (
              <div
                key={user.userId}
                className="relative bg-gray-900 bg-opacity-80 rounded-2xl shadow-lg hover:shadow-green-500/40 p-6 text-center transition-all transform hover:-translate-y-2 w-72"
              >
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg">
                  #{user.rank}
                </div>
                <img
                  src={user.image}
                  alt={user.userName}
                  className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-green-500 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{user.userName}</h3>
                <p className="text-gray-400 mb-4">Match Score: {user.score}%</p>
                <p className="text-sm text-gray-400 mb-3">{user.commonSongs} songs in common</p>
              </div>
            ))}
          </div>

          {otherUsers.length > 0 && (
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-300">
                More Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="bg-gray-900 bg-opacity-70 rounded-2xl p-6 text-center hover:shadow-green-500/30 shadow-lg transition-all hover:-translate-y-2"
                  >
                    <img
                      src={user.image}
                      alt={user.userName}
                      className="w-24 h-24 mx-auto rounded-full border-2 border-green-400 mb-3 object-cover"
                    />
                    <h3 className="text-lg font-semibold">{user.userName}</h3>
                    <p className="text-gray-400 mb-2">Match: {user.score}%</p>
                    <p className="text-sm text-gray-500">{user.commonSongs} songs in common</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Ranking;
