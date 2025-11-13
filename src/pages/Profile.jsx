import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaUser, FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();

  // User
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Favorites
  const [favorites, setFavorites] = useState({ artists: [], songs: [] });

  // All artists/songs - ensure they're always arrays
  const [allArtists, setAllArtists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Add artist/song UI
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedSongId, setSelectedSongId] = useState("");

  const [filteredArtists, setFilteredArtists] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);

  // ----------------------------------
  // FETCH USER
  // ----------------------------------
  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      try {
        await Promise.all([
          fetchFavorites(parsedUser.id),
          fetchArtists(),
          fetchSongs()
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ----------------------------------
  // FETCH FAVORITES
  // ----------------------------------
  const fetchFavorites = async (userId) => {
    try {
      console.log('Fetching favorites for user:', userId);
  const response = await fetch(`/api/user/favorites?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important for sessions
      });
      
      if (response.status === 401) {
        // Not authenticated on the server - clear local user and redirect to login
        console.error('Failed to fetch favorites: Authentication required');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const result = await response.json();
      console.log('Favorites response:', result);
      
      if (result.success && result.data) {
        setFavorites({
          artists: Array.isArray(result.data.artists) ? result.data.artists : [],
          songs: Array.isArray(result.data.songs) ? result.data.songs : []
        });
      } else {
        console.error('Failed to fetch favorites:', result.message || 'Unknown error');
        setFavorites({ artists: [], songs: [] });
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setFavorites({ artists: [], songs: [] });
    }
  };

  // ----------------------------------
  // FETCH ARTISTS
  // ----------------------------------
  const fetchArtists = useCallback(async () => {
    try {
      setLoadingArtists(true);
  const response = await fetch('/api/artists');
      if (response.ok) {
        const result = await response.json();
        // Handle both response formats: {success, data} or direct array
        const artists = result.data || result || [];
        console.log('Fetched artists:', artists);
        setAllArtists(Array.isArray(artists) ? artists : []);
      } else {
        console.error('Failed to fetch artists:', response.status);
        setAllArtists([]);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      setAllArtists([]);
    } finally {
      setLoadingArtists(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // ----------------------------------
  // FETCH SONGS
  // ----------------------------------
  const fetchSongs = useCallback(async () => {
    try {
      setLoadingSongs(true);
      console.log('Fetching songs from API...');
  const response = await fetch('/api/songs');
      const result = await response.json();
      console.log('Songs API response:', result);
      
      if (response.ok) {
        // The API returns { success: true, data: [...] }
        const songs = result.data || result || []; // Handle both formats
        console.log('Processed songs data:', songs);
        
        // Transform the data to ensure consistent structure
        const transformedSongs = songs.map(song => ({
          id: song.id,
          song_name: song.song_name || song.name,
          artist_name: song.artist_name || 'Unknown Artist',
          artist_id: song.artist_id
        }));
        
        console.log('Transformed songs:', transformedSongs);
        setAllSongs(transformedSongs);
      } else {
        console.error('Failed to fetch songs:', response.status, result);
        setAllSongs([]);
      }
    } catch (err) {
      console.error("Error fetching songs:", err);
      setAllSongs([]);
    } finally {
      setLoadingSongs(false);
    }
  }, []);

  // ----------------------------------
  // AVAILABLE OPTIONS (exclude already-favorited)
  // ----------------------------------
  const availableArtists = useMemo(() => {
    const artists = Array.isArray(allArtists) ? allArtists : [];
    const favArtists = Array.isArray(favorites.artists) ? favorites.artists : [];
    
    return artists.filter(artist => 
      !favArtists.some(fav => String(fav.id) === String(artist.id))
    );
  }, [allArtists, favorites.artists]);

  const availableSongs = useMemo(() => {
    console.log('All songs:', allSongs);
    // Return all songs without filtering out favorites
    return Array.isArray(allSongs) ? allSongs : [];
  }, [allSongs]);

  // ----------------------------------
  // Get artist and song by ID
  const getArtistById = (id) => availableArtists.find(a => a.id === id);
  const getSongById = (id) => availableSongs.find(s => s.id === id);

  // ----------------------------------
  // ADD ARTIST
  // ----------------------------------
  const handleAddArtist = async () => {
    if (!selectedArtistId || !user?.id) return;
    
    try {
  const response = await fetch('/api/user/favorites/artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          artistId: selectedArtistId
        })
      });
      
      const result = await response.json();
      console.log('Add artist response:', result);
      
      if (result.success) {
        // Refresh the favorites after adding
        await fetchFavorites(user.id);
        setShowAddArtist(false);
        setSelectedArtistId("");
      } else {
        console.error('Failed to add artist:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding favorite artist:', error);
    }
  };

  // ----------------------------------
  // ADD SONG
  // ----------------------------------
  const handleAddSong = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    if (!selectedSongId) {
      console.error('No song selected');
      return;
    }

    try {
      console.log('Attempting to add song to favorites:', { 
        userId: user.id, 
        songId: selectedSongId,
        currentFavorites: favorites
      });
      
  const response = await fetch('/api/user/favorites/song', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: user.id, 
          songId: selectedSongId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Add song response:', result);
      
      if (result.success) {
        // Refresh the favorites after adding
        await fetchFavorites(user.id);
        setShowAddSong(false);
        setSelectedSongId("");
        
        // Show success message or update UI as needed
        console.log('Successfully added song to favorites');
      } else {
        throw new Error(result.message || 'Failed to add song to favorites');
      }
    } catch (error) {
      console.error('Error in handleAddSong:', {
        error: error,
        message: error.message,
        stack: error.stack
      });
      alert(error.message || 'Failed to add song to favorites. Please check the console for details.');
    }
  };

  const removeFavorite = async (item, type) => {
    try {
      const endpoint =
        type === "artist"
          ? `/api/user/favorites/artist?userId=${user.id}&artistId=${item.id}`
          : `/api/user/favorites/song?userId=${user.id}&songId=${item.id}`;

      await fetch(endpoint, { method: "DELETE" });
      await fetchFavorites(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------
  // LOADING SCREEN
  // ----------------------------------
  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );

  // ----------------------------------
  // UI
  // ----------------------------------
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* USER HEADER */}
      <div className="bg-gray-900 p-6 rounded-xl mb-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FAVORITE ARTISTS */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaUser className="text-green-400 mr-2" />
              Favorite Artists
            </h2>

            <button
              className="bg-gray-800 px-3 py-1 rounded-full flex items-center"
              onClick={() => setShowAddArtist(!showAddArtist)}
            >
              <FaPlus size={12} className="mr-1" /> Add
            </button>
          </div>

          {showAddArtist && (
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <select
                className="w-full p-2 bg-gray-700 rounded mb-2 text-white"
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                autoFocus
              >
                <option value="">Select an artist</option>
                {availableArtists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.artist_name}
                  </option>
                ))}
              </select>

              <button
                disabled={!selectedArtistId}
                onClick={handleAddArtist}
                className="bg-green-600 px-3 py-1 rounded mt-2 float-right disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          {/* LIST */}
          <ul className="space-y-2">
            {favorites.artists.map((a) => (
              <li
                key={a.id}
                className="bg-gray-800 p-3 rounded flex justify-between items-center"
              >
                {a.artist_name}
                <FaTimes
                  onClick={() => removeFavorite(a, "artist")}
                  className="text-red-400 cursor-pointer hover:text-red-300"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* FAVORITE SONGS */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaMusic className="text-green-400 mr-2" />
              Favorite Songs
            </h2>

            <button
              className="bg-gray-800 px-3 py-1 rounded-full flex items-center"
              onClick={() => setShowAddSong(!showAddSong)}
            >
              <FaPlus size={12} className="mr-1" /> Add
            </button>
          </div>

          {showAddSong && (
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <div className="mb-2">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Select a song to add to favorites:
                  </label>
                  <select
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={selectedSongId}
                    onChange={(e) => {
                      console.log('Selected song ID:', e.target.value);
                      setSelectedSongId(e.target.value);
                    }}
                    disabled={loadingSongs || availableSongs.length === 0}
                    autoFocus
                  >
                    <option value="">
                      {loadingSongs ? 'Loading songs...' : 
                       availableSongs.length === 0 ? 'No songs available' : 
                       '-- Select a song --'}
                    </option>
                    {availableSongs.map((song) => (
                      <option 
                        key={`song-${song.id}`} 
                        value={song.id}
                        className="bg-gray-800 text-white"
                      >
                        {song.song_name} - {song.artist_name || 'Unknown Artist'}
                      </option>
                    ))}
                  </select>
                  {!loadingSongs && availableSongs.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      {availableSongs.length} songs available
                    </p>
                  )}
                </div>
                {loadingSongs && (
                  <p className="text-sm text-gray-400 mt-1">Loading songs...</p>
                )}
                {!loadingSongs && availableSongs.length === 0 && (
                  <p className="text-sm text-yellow-400 mt-1">
                    {allSongs.length > 0 ? 'All songs have been added to favorites' : 'No songs available'}
                  </p>
                )}
              </div>

              <button
                disabled={!selectedSongId}
                onClick={handleAddSong}
                className="bg-green-600 px-3 py-1 rounded mt-2 float-right disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          {/* LIST */}
          <ul className="space-y-2">
            {favorites.songs.map((s) => (
              <li
                key={s.id}
                className="bg-gray-800 p-3 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{s.song_name}</div>
                    <div className="text-sm text-gray-400">{s.artist_name}</div>
                  </div>

                  <FaTimes
                    onClick={() => removeFavorite(s, "song")}
                    className="text-red-400 cursor-pointer hover:text-red-300"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Profile;
