import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Compare from "./pages/Compare";
import AuthCallback from "./pages/AuthCallback";

// A wrapper to handle authentication
const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated by verifying with backend
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid auth response');
          }
        } else {
          throw new Error('Not authenticated');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const user = localStorage.getItem('user');
    if (user) {
      verifyAuth();
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));
  
  const handleLogin = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    navigate('/home');
  };

  const handleLogout = () => {
    // Call backend logout endpoint
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => {
      console.error('Error during logout:', err);
    }).finally(() => {
      // Clear local storage regardless of backend response
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/login');
    });
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
              <Login onLogin={handleLogin} isAuthenticated={isAuthenticated} />
            </div>
          )
        } 
      />
      
      <Route 
        path="/auth/callback" 
        element={<AuthCallback onLogin={handleLogin} />} 
      />
      
      <Route 
        path="/" 
        element={
          <Navigate to="/login" replace />
        } 
      />
      
      <Route 
        path="/home" 
        element={
          <PrivateRoute>
            <Home onLogout={handleLogout} />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile onBack={() => navigate('/home')} onLogout={handleLogout} />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/ranking" 
        element={
          <PrivateRoute>
            <Ranking onBack={() => navigate('/home')} />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/compare" 
        element={
          <PrivateRoute>
            <Compare onBack={() => navigate('/ranking')} />
          </PrivateRoute>
        } 
      />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
