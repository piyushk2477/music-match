import React from "react";

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-green-600 via-black to-gray-900 p-10">
        <h1 className="text-5xl font-extrabold mb-4 text-white tracking-wide">
          🎵 Music Match
        </h1>
        <p className="text-gray-200 text-lg text-center max-w-md">
          Discover your top artists, favorite songs, and connect with people who
          share your vibe.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-center items-center bg-gray-900">
        <div className="bg-gray-800 bg-opacity-70 p-10 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] text-center">
          <h2 className="text-3xl font-semibold mb-6">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Login with your Spotify account</p>

          <button
            onClick={onLogin}
            className="bg-green-500 hover:bg-green-600 transition text-white font-semibold py-3 px-6 rounded-full w-full shadow-lg"
          >
            Login with Spotify
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
