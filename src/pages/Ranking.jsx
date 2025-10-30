import React from "react";

const topUsers = [
  { id: 1, name: "Arjun Sharma", rank: 1, score: 98, image: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 2, name: "Priya Verma", rank: 2, score: 95, image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 3, name: "Rohit Singh", rank: 3, score: 92, image: "https://randomuser.me/api/portraits/men/34.jpg" },
];

const otherUsers = [
  { id: 4, name: "Aditi Mehra", rank: 4, score: 88, image: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 5, name: "Vikram Patel", rank: 5, score: 84, image: "https://randomuser.me/api/portraits/men/77.jpg" },
  { id: 6, name: "Sneha Kapoor", rank: 6, score: 80, image: "https://randomuser.me/api/portraits/women/56.jpg" },
];

const Ranking = ({ onBack, onCompare }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6 py-10">
      <button
        onClick={() => onBack("home")}
        className="mb-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-semibold"
      >
        ← Back to Home
      </button>

      <h1 className="text-4xl font-extrabold text-center mb-12 text-green-400">
        🏆 Top Music Matches
      </h1>

      {/* Top 3 Users */}
      <div className="flex flex-wrap justify-center gap-10 mb-16">
        {topUsers.map((user) => (
          <div
            key={user.id}
            className={`relative bg-gray-900 bg-opacity-80 rounded-2xl shadow-lg hover:shadow-green-500/40 p-6 text-center transition-all transform hover:-translate-y-2 w-72`}
          >
            <div
              className={`absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg`}
            >
              #{user.rank}
            </div>
            <img
              src={user.image}
              alt={user.name}
              className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-green-500 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
            <p className="text-gray-400 mb-4">Match Score: {user.score}%</p>
            <button
              onClick={() => onCompare(user)}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-5 rounded-full shadow-md hover:shadow-green-400/40 transition-all"
            >
              Compare
            </button>
          </div>
        ))}
      </div>

      {/* Other Users */}
      <h2 className="text-2xl font-bold mb-8 text-center text-green-400">
        Other Matches
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="bg-gray-900 bg-opacity-70 rounded-2xl p-6 text-center hover:shadow-green-500/30 shadow-lg transition-all hover:-translate-y-2"
          >
            <img
              src={user.image}
              alt={user.name}
              className="w-24 h-24 mx-auto rounded-full border-2 border-green-400 mb-3 object-cover"
            />
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-400 mb-4">Match Score: {user.score}%</p>
            <button
              onClick={() => onCompare(user)}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-green-400/40 transition-all"
            >
              Compare
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
