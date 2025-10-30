import React from "react";

const myProfile = {
  name: "You",
  minutes: 23456,
  topSongs: [
    "Blinding Lights – The Weeknd",
    "Levitating – Dua Lipa",
    "Save Your Tears – The Weeknd",
    "Peaches – Justin Bieber",
    "Stay – The Kid LAROI",
  ],
  topArtists: ["The Weeknd", "Dua Lipa", "Drake", "Justin Bieber", "Ed Sheeran"],
  image: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
};

const otherProfile = {
  name: "Arjun Sharma",
  minutes: 19234,
  topSongs: [
    "Heat Waves – Glass Animals",
    "Stay – The Kid LAROI",
    "Shape of You – Ed Sheeran",
    "Starboy – The Weeknd",
    "Peaches – Justin Bieber",
  ],
  topArtists: ["Ed Sheeran", "The Weeknd", "Post Malone", "Drake", "Coldplay"],
  image: "https://randomuser.me/api/portraits/men/45.jpg",
};

const Compare = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center py-10 px-6">
      <button
        onClick={onBack}
        className="self-start mb-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-semibold"
      >
        ← Back to Rankings
      </button>

      <h1 className="text-4xl font-extrabold mb-10 text-green-400 text-center">
        🎧 Music Taste Comparison
      </h1>

      {/* Profile Comparison */}
      <div className="flex flex-col md:flex-row justify-center gap-12 w-full max-w-5xl">
        {/* My Profile */}
        <div className="flex-1 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <img
            src={myProfile.image}
            alt={myProfile.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-green-500 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{myProfile.name}</h2>
          <p className="text-gray-400 mb-6">
            🎵 Minutes Listened:{" "}
            <span className="text-green-400 font-semibold">
              {myProfile.minutes.toLocaleString()}
            </span>
          </p>

          <div className="w-full text-left mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Songs
            </h3>
            <ul className="space-y-2 text-gray-300">
              {myProfile.topSongs.map((song, i) => (
                <li key={i} className="border-b border-gray-700 pb-1">
                  {i + 1}. {song}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full text-left">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Artists
            </h3>
            <ul className="space-y-2 text-gray-300">
              {myProfile.topArtists.map((artist, i) => (
                <li key={i} className="border-b border-gray-700 pb-1">
                  {i + 1}. {artist}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="bg-green-500 text-black font-extrabold rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg">
            VS
          </div>
        </div>

        {/* Other Profile */}
        <div className="flex-1 bg-gray-900 bg-opacity-70 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <img
            src={otherProfile.image}
            alt={otherProfile.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-green-500 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{otherProfile.name}</h2>
          <p className="text-gray-400 mb-6">
            🎵 Minutes Listened:{" "}
            <span className="text-green-400 font-semibold">
              {otherProfile.minutes.toLocaleString()}
            </span>
          </p>

          <div className="w-full text-left mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Songs
            </h3>
            <ul className="space-y-2 text-gray-300">
              {otherProfile.topSongs.map((song, i) => (
                <li key={i} className="border-b border-gray-700 pb-1">
                  {i + 1}. {song}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full text-left">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Top 5 Artists
            </h3>
            <ul className="space-y-2 text-gray-300">
              {otherProfile.topArtists.map((artist, i) => (
                <li key={i} className="border-b border-gray-700 pb-1">
                  {i + 1}. {artist}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
