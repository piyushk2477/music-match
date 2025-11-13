import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!credentials.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!credentials.password) {
      setError('Password is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginData = {
        email: credentials.email, // Changed from username to email to match backend expectation
        password: credentials.password
      };
      
      console.log('Sending login request to:', '/api/auth/login');
      console.log('Request payload:', loginData);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Call the onLogin callback with the user data
      if (data.user) {
        onLogin(data.user);
        navigate('/home');
      } else {
        throw new Error('No user data received from server');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-purple-900 to-gray-900 py-12 px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-purple-200">
            Sign in to continue to Music Match
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8">

          {error && (
            <div className="mb-6 bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-purple-200 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                id="email"
                className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="example@gmail.com"
                value={credentials.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-purple-200 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                id="password"
                className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3  from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-purple-300">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-white font-medium cursor-pointer hover:text-purple-200"
              >
                Sign up
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
