import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaUser, FaArrowLeft, FaPlus, FaTimes, FaSignOutAlt, FaTrash } from "react-icons/fa";

const Profile = ({ onLogout }) => {
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

  // Change password UI
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account UI
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
  // LOGOUT
  // ----------------------------------
  const handleLogout = () => {
    // Call the logout function passed from App component
    if (onLogout) {
      onLogout();
    }
  };

  // ----------------------------------
  // CHANGE PASSWORD
  // ----------------------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    // Validation
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      // First, verify current password by attempting to login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: user.email,
          password: currentPassword
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (!loginResult.success) {
        setPasswordError("Current password is incorrect");
        return;
      }
      
      // If current password is correct, update to new password
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          password: newPassword
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPasswordSuccess("Password changed successfully!");
        // Clear form fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Hide the change password form after a delay
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ----------------------------------
  // DELETE ACCOUNT
  // ----------------------------------
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    try {
      setIsDeletingAccount(true);
    
      console.log('Sending DELETE request to /api/auth/account');
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      console.log('Received response:', response);

      const result = await response.json();
      console.log('Parsed result:', result);
    
      if (result.success) {
        // Clear local storage
        localStorage.removeItem('user');
        // Call the logout function passed from App component
        if (onLogout) {
          onLogout();
        }
        // Redirect to login page
        navigate('/login');
      } else {
        console.error('Failed to delete account:', result.message);
        alert('Failed to delete account: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccount(false);
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
        className="flex items-center text-gray-400 hover:text-white mb-6 border border-dashed border-gray-400 px-4 py-2 rounded"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* USER HEADER */}
      <div className="bg-gray-900 p-6 rounded-[5px] mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
            {user.listening_minutes !== undefined && user.listening_minutes !== null && (
              <p className="text-gray-400 mt-1">
                November Listening Time: {user.listening_minutes} minutes
              </p>
            )}
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      {/* Change Password Form */}
      {showChangePassword && (
        <div className="bg-gray-900 p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Change Password</h2>
            <button 
              onClick={() => {
                setShowChangePassword(false);
                setPasswordError("");
                setPasswordSuccess("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          
          {passwordSuccess && (
            <div className="bg-green-900/30 border border-green-700 text-green-200 p-3 rounded-lg mb-4">
              {passwordSuccess}
            </div>
          )}
          
          {passwordError && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-lg mb-4">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                placeholder="Enter current password"
                disabled={isChangingPassword}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                placeholder="Enter new password (min 6 characters)"
                disabled={isChangingPassword}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                placeholder="Confirm new password"
                disabled={isChangingPassword}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isChangingPassword}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center"
              >
                {isChangingPassword ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete Account</h2>
              <button 
                onClick={() => setShowDeleteAccount(false)}
                className="text-gray-400 hover:text-white"
                disabled={isDeletingAccount}
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data including favorite artists and songs will be permanently deleted.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteAccount(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isDeletingAccount}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center"
              >
                {isDeletingAccount ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FAVORITE ARTISTS */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaUser className="text-green-400 mr-2" />
              Favorite Artists (from Spotify)
            </h2>
          </div>

          {/* LIST */}
          <ul className="space-y-2">
            {favorites.artists.length > 0 ? (
              favorites.artists.map((a) => (
                <li
                  key={a.id}
                  className="bg-gray-800 p-3 rounded flex justify-between items-center"
                >
                  {a.artist_name}
                </li>
              ))
            ) : (
              <li className="bg-gray-800 p-3 rounded text-gray-400 text-center">
                No favorite artists found. Login with Spotify to import your favorites.
              </li>
            )}
          </ul>
          
          
        </div>

        {/* FAVORITE SONGS */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaMusic className="text-green-400 mr-2" />
              Favorite Songs (from Spotify)
            </h2>
          </div>

          {/* LIST */}
          <ul className="space-y-2">
            {favorites.songs.map((s) => (
              <li
                key={s.id}
                className="bg-gray-800 p-3 rounded"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">{s.song_name}</div>
                    <div className="text-sm text-gray-400"> By {s.artist_name}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Change Password Button */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowChangePassword(true)}
          className="py-6 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors text-center cursor-pointer"
        >
          Change Password
        </button>
        <button
          onClick={() => setShowDeleteAccount(true)}
          className="py-6 bg-red-900 hover:bg-red-700 rounded-lg transition-colors text-center cursor-pointer"
        >
          <div className="flex items-center justify-center">
            <FaTrash className="mr-2" />
            Delete Account
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profile;
