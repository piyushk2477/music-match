import React from "react";

const Profile = ({ user, onBack }) => {
  if (!user) return null;

  const topSongs = [
    "Blinding Lights",
    "Shape of You",
    "Stay",
    "Levitating",
    "Peaches",
  ];

  const topArtists = [
    "The Weeknd",
    "Ed Sheeran",
    "Justin Bieber",
    "Dua Lipa",
    "Drake",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center py-10">
      <button
        onClick={onBack}
        className="mb-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-semibold"
      >
        ← Back to Home
      </button>

      <div className="bg-gray-900 bg-opacity-80 p-10 rounded-2xl shadow-2xl w-[90%] sm:w-[500px] text-center">
        <img
          src={user.image}
          alt={user.name}
          className="w-32 h-32 mx-auto rounded-full mb-6 border-4 border-green-500 object-cover"
        />
        <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
        <p className="text-gray-400 mb-8">Music Lover | Top 5 Songs & Artists</p>

        <div className="text-left">
          <h3 className="text-xl font-semibold mb-3 text-green-400">Top 5 Songs</h3>
          <ul className="mb-6 space-y-2">
            {topSongs.map((song, index) => (
              <li key={index} className="bg-gray-800 px-4 py-2 rounded-lg">
                🎵 {song}
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-green-400">Top 5 Artists</h3>
          <ul className="space-y-2">
            {topArtists.map((artist, index) => (
              <li key={index} className="bg-gray-800 px-4 py-2 rounded-lg">
                🎤 {artist}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
