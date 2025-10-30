import React, { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Compare from "./pages/Compare";

const App = () => {
  const [page, setPage] = useState("login");
  const [selectedUser, setSelectedUser] = useState(null);
  const [compareUser, setCompareUser] = useState(null);

  const handleSpotifyLogin = () => setPage("home");

  const handleUserSelect = (user) => {
    if (user === "ranking") setPage("ranking");
    else {
      setSelectedUser(user);
      setPage("profile");
    }
  };

  const handleBackToHome = (next) => {
    if (next === "compare") setPage("compare");
    else setPage("home");
  };

  const handleCompare = (user) => {
    setCompareUser(user);
    setPage("compare");
  };

  return (
    <>
      {page === "login" && <Login onLogin={handleSpotifyLogin} />}
      {page === "home" && <Home onUserSelect={handleUserSelect} />}
      {page === "profile" && (
        <Profile user={selectedUser} onBack={handleBackToHome} />
      )}
      {page === "ranking" && (
        <Ranking onBack={handleBackToHome} onCompare={handleCompare} />
      )}
      {page === "compare" && (
        <Compare user={compareUser} onBack={() => setPage("ranking")} />
      )}
    </>
  );
};

export default App;
