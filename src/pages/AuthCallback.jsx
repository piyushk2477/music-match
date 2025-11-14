import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      console.log('Auth callback - success param:', success);
      console.log('Current URL:', window.location.href);
      console.log('Window location origin:', window.location.origin);
      
      if (success === 'true') {
        try {
          console.log('Fetching user data from /api/auth/me...');
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log('Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('User data received:', data);
            
            if (data.success && data.user) {
              // Check if this is a new user without a password
              if (data.user.isNewUser) {
                console.log('New user detected, showing password setup modal');
                setUserData(data.user);
                setShowPasswordModal(true);
              } else {
                console.log('Existing user, redirecting to home');
                console.log('Redirecting to: /home');
                onLogin(data.user);
                navigate('/home');
              }
            } else {
              console.error('No user data in response:', data);
              throw new Error('Failed to get user data');
            }
          } else {
            const errorData = await response.text();
            console.error('Authentication failed. Status:', response.status, 'Response:', errorData);
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Error in auth callback:', error);
          navigate('/login');
        }
      } else {
        console.log('Success param not true, redirecting to login');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Password set successfully');
        // Remove isNewUser flag and continue to home
        const updatedUser = { ...userData, isNewUser: false };
        onLogin(updatedUser);
        console.log('Redirecting to: /home');
        navigate('/home');
      } else {
        setPasswordError(data.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      {!showPasswordModal ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Authenticating with Spotify...</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome, {userData?.name}!</h2>
            <p className="text-gray-400">Please set a password for your account</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                placeholder="Enter password (min 6 characters)"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                placeholder="Confirm your password"
                required
                disabled={isSubmitting}
              />
            </div>

            {passwordError && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Setting up...' : 'Continue to Music Match'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
