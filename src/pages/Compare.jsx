import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Compare = ({ onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUser, currentUser } = location.state || {};

  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no user data is passed, redirect to home
    if (!selectedUser || !currentUser) {
      navigate('/home');
      return;
    }

    const fetchCurrentUserFavorites = async () => {
      try {
        // Fetch current user's favorites
        const response = await fetch(`/api/user/favorites?userId=${currentUser.id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCurrentUserData({
              ...currentUser,
              topSongs: data.data.songs || [],
              topArtists: data.data.artists || []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching current user favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserFavorites();
  }, [selectedUser, currentUser, navigate]);

  // Calculate Jaccard similarity for songs
  const calculateSongSimilarity = () => {
    if (!currentUserData || !selectedUser) return 0;
    
    const currentUserSongs = currentUserData.topSongs || [];
    const selectedUserSongs = selectedUser.topSongs || [];
    
    // Convert to sets for faster lookup
    const currentUserSongIds = new Set(currentUserSongs.map(song => song.id));
    const selectedUserSongIds = new Set(selectedUserSongs.map(song => song.id));
    
    // Calculate intersection and union
    const intersection = [...currentUserSongIds].filter(id => selectedUserSongIds.has(id)).length;
    const union = new Set([...currentUserSongIds, ...selectedUserSongIds]).size;
    
    return union > 0 ? (intersection / union) : 0;
  };

  // Calculate Jaccard similarity for artists
  const calculateArtistSimilarity = () => {
    if (!currentUserData || !selectedUser) return 0;
    
    const currentUserArtists = currentUserData.topArtists || [];
    const selectedUserArtists = selectedUser.topArtists || [];
    
    // Convert to sets for faster lookup
    const currentUserArtistIds = new Set(currentUserArtists.map(artist => artist.id));
    const selectedUserArtistIds = new Set(selectedUserArtists.map(artist => artist.id));
    
    // Calculate intersection and union
    const intersection = [...currentUserArtistIds].filter(id => selectedUserArtistIds.has(id)).length;
    const union = new Set([...currentUserArtistIds, ...selectedUserArtistIds]).size;
    
    return union > 0 ? (intersection / union) : 0;
  };

  // Calculate combined similarity (equal weight to songs and artists)
  const calculateCombinedSimilarity = () => {
    const songSimilarity = calculateSongSimilarity();
    const artistSimilarity = calculateArtistSimilarity();
    return (songSimilarity + artistSimilarity) / 2;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!selectedUser || !currentUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center py-10 px-6">
        <button
          onClick={() => navigate('/discover')}
          className="self-start mb-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-dashed border-gray-400 cursor-pointer"
        >
          ← Back to Discover
        </button>
        <div className="text-center py-12 text-gray-500">
          User data not available.
        </div>
      </div>
    );
  }

  const songSimilarity = calculateSongSimilarity();
  const artistSimilarity = calculateArtistSimilarity();
  const combinedSimilarity = calculateCombinedSimilarity();
  const similarityPercentage = Math.round(combinedSimilarity * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center py-10 px-6">
      <button
        onClick={() => navigate('/discover')}
        className="self-start mb-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-dashed border-gray-400 cursor-pointer"
      >
        ← Back to Discover
      </button>

      <h1 className="text-4xl font-extrabold mb-10 text-green-400 text-center">
        Music Taste Comparison
      </h1>

      {/* Similarity Score */}
      <div className="mb-10 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Similarity Score</h2>
        <div className="text-5xl font-bold text-green-400 mb-2">
          {similarityPercentage}%
        </div>
        <p className="text-gray-400">
          Based on favorite songs and artists
        </p>
      </div>

      {/* Profile Comparison */}
      <div className="flex flex-col md:flex-row justify-center gap-12 w-full max-w-5xl">
        {/* Current User Profile */}
        <div className="flex-1 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 ${getColorForUser(currentUserData.name)}`}>
            {getInitials(currentUserData.name)}
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentUserData.name}</h2>
          <p className="text-gray-400 mb-6">
            Minutes Listened:{" "}
            <span className="text-green-400 font-semibold">
              {currentUserData.listening_minutes?.toLocaleString() || 0}
            </span>
          </p>

          <div className="w-full text-left mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Songs
            </h3>
            <ul className="space-y-2 text-gray-300">
              {currentUserData.topSongs && currentUserData.topSongs.length > 0 ? (
                currentUserData.topSongs.slice(0, 5).map((song, i) => (
                  <li key={song.id} className="border-b border-gray-700 pb-1">
                    {i + 1}. {song.song_name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No favorite songs yet</li>
              )}
            </ul>
          </div>

          <div className="w-full text-left">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Artists
            </h3>
            <ul className="space-y-2 text-gray-300">
              {currentUserData.topArtists && currentUserData.topArtists.length > 0 ? (
                currentUserData.topArtists.slice(0, 5).map((artist, i) => (
                  <li key={artist.id} className="border-b border-gray-700 pb-1">
                    {i + 1}. {artist.artist_name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No favorite artists yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="bg-green-500 text-black font-extrabold rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg">
            VS
          </div>
        </div>

        {/* Selected User Profile */}
        <div className="flex-1 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 ${getColorForUser(selectedUser.userName)}`}>
            {getInitials(selectedUser.userName)}
          </div>
          <h2 className="text-2xl font-bold mb-2">{selectedUser.userName}</h2>
          <p className="text-gray-400 mb-6">
            Minutes Listened:{" "}
            <span className="text-green-400 font-semibold">
              {selectedUser.listeningMinutes?.toLocaleString() || 0}
            </span>
          </p>

          <div className="w-full text-left mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Songs
            </h3>
            <ul className="space-y-2 text-gray-300">
              {selectedUser.topSongs && selectedUser.topSongs.length > 0 ? (
                selectedUser.topSongs.slice(0, 5).map((song, i) => (
                  <li key={song.id} className="border-b border-gray-700 pb-1">
                    {i + 1}. {song.song_name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No favorite songs yet</li>
              )}
            </ul>
          </div>

          <div className="w-full text-left">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Artists
            </h3>
            <ul className="space-y-2 text-gray-300">
              {selectedUser.topArtists && selectedUser.topArtists.length > 0 ? (
                selectedUser.topArtists.slice(0, 5).map((artist, i) => (
                  <li key={artist.id} className="border-b border-gray-700 pb-1">
                    {i + 1}. {artist.artist_name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No favorite artists yet</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Similarity Breakdown */}
      <div className="mt-10 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-center">Similarity Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Song Similarity</span>
              <span className="text-green-400 font-semibold">
                {Math.round(songSimilarity * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${songSimilarity * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Artist Similarity</span>
              <span className="text-green-400 font-semibold">
                {Math.round(artistSimilarity * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${artistSimilarity * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;