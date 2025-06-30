import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../services/authService'; // Mock service

// Helper function to get returnUrl from localStorage or default
const getStoredReturnUrl = () => {
  return localStorage.getItem('oauth_returnurl') || '/dashboard';
};

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state'); // Optional: for CSRF protection, not fully implemented in this mock

    // Determine provider from path or state (more robust to get from state if set)
    // For this example, we'll infer from a stored value or path if necessary,
    // but ideally, the 'provider' info would be available more directly.
    // Let's assume we stored it or can infer it.
    // For now, we'll need to know which provider this callback is for.
    // A simple way is to use different callback paths in App.jsx and pass provider prop.
    // This component will be generic, provider passed as a prop.
    // This will be set up in App.jsx by routing /auth/google/callback and /auth/github/callback to this component with a prop.

    const provider = location.pathname.includes('/google/') ? 'google' :
                     location.pathname.includes('/github/') ? 'github' : null;

    if (!provider) {
        setError("Could not determine OAuth provider from callback URL.");
        setMessage('');
        return;
    }

    const processOAuth = async () => {
      if (code) {
        try {
          // TODO: Replace with actual API call to your backend
          const response = await exchangeCodeForToken(code, provider);
          if (response.success && response.token) {
            setMessage('Authentication successful! Redirecting to Graphy...');

            const graphyBaseUrl = import.meta.env.VITE_GRAPHY_URL || 'https://<your-graphy-domain>.graphy.com';
            const returnUrl = getStoredReturnUrl(); // Get the stored returnUrl
            localStorage.removeItem('oauth_returnurl'); // Clean up stored returnUrl

            const targetPath = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
            const redirectUrl = `${graphyBaseUrl}${targetPath}?ssoToken=${response.token}`;

            window.location.href = redirectUrl;
          } else {
            setError(response.message || `OAuth failed with ${provider}.`);
            setMessage('');
          }
        } catch (err) {
          setError(err.message || `An error occurred during OAuth with ${provider}.`);
          setMessage('');
        }
      } else {
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        setError(`OAuth failed: ${errorParam || 'No authorization code received.'} ${errorDescription ? '- ' + errorDescription : ''}`);
        setMessage('');
      }
    };

    processOAuth();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        {message && <p className="text-xl mb-4">{message}</p>}
        {error && <p className="text-xl text-red-500 mb-4">Error: {error}</p>}
        {(message || error) && (
            <svg className="animate-spin h-8 w-8 text-yellow mx-auto mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        )}
        {error && (
            <button
                onClick={() => navigate('/')}
                className="mt-6 bg-yellow text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-600"
            >
                Go to Homepage
            </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
