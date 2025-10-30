import React from "react";

const dummyUsers = [
  {
    id: 1,
    name: "Arjun Sharma",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 2,
    name: "Priya Verma",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 3,
    name: "Rohit Singh",
    image: "https://randomuser.me/api/portraits/men/34.jpg",
  },
  {
    id: 4,
    name: "Aditi Mehra",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: 5,
    name: "Vikram Patel",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
  },
];

const Home = ({ onUserSelect }) => {
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Background gradient & blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-black to-gray-900 opacity-90"></div>
        <div className="absolute w-[600px] h-[600px] bg-green-500 blur-[160px] opacity-20 animate-pulse rounded-full -top-20 -left-20"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[160px] opacity-20 animate-pulse rounded-full bottom-10 right-10"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Feel the <span className="text-green-400">Beat</span>.  
            Find your <span className="text-green-400">Vibe</span>.
          </h1>
          <p className="text-gray-300 text-lg mb-10">
            Explore people who share your taste in music.  
            Discover songs, connect, and vibe together.
          </p>
          <a
            href="#users"
            className="bg-green-500 hover:bg-green-600 transition-all text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-green-500/40"
          >
            Meet Music Lovers ↓
          </a>
          <a
  onClick={() => onUserSelect("ranking")}
  className="ml-4 bg-gray-800 hover:bg-gray-700 transition-all text-white font-semibold py-3 px-8 rounded-full shadow-lg cursor-pointer"
>
  View Rankings 🏆
</a>

        </div>
      </section>

      {/* Users Section */}
      <section id="users" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold mb-12 text-center text-green-400">
          Popular Listeners
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {dummyUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onUserSelect(user)}
              className="relative group bg-gray-900 rounded-2xl text-center overflow-hidden shadow-xl hover:shadow-green-500/30 cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-72 object-cover"
              />
              <div className="absolute bottom-5 left-0 right-0 z-10">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-300">Tap to view profile</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-24 text-center text-gray-400 max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-3 text-white">
            🎵 Connect • Discover • Match
          </h3>
          <p>
            Music Match helps you explore listeners who vibe with your rhythm.  
            Check out profiles, top songs, and favorite artists — and see how your music connects.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
