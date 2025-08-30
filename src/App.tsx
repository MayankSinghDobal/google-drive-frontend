import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Callback from "./components/Auth/Callback";
import SharedFile from "./components/SharedFile/SharedFile"; // NEW IMPORT
import axios from "axios";
import type { User } from "./types";

interface AuthResponse {
  user: User;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Configure axios defaults
axios.defaults.withCredentials = true;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('Checking auth status:', `${API_BASE_URL}/auth/me`);
        const response = await axios.get<AuthResponse>(
          `${API_BASE_URL}/auth/me`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true,
          }
        );
        
        console.log('Auth check successful:', response.data);
        setUser(response.data.user);
      } catch (error: any) {
        console.error('Auth check failed:', {
          message: error.message || 'Unknown error',
          response: error.response?.data,
          status: error.response?.status,
        });
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuth = (user: User) => {
    console.log('User authenticated:', user);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsSignup(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is not set');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Configuration Error</h1>
        <p>Google Client ID is not configured. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Layout />
              ) : isSignup ? (
                <Signup 
                  onSignup={handleAuth} 
                  setIsSignup={setIsSignup}
                />
              ) : (
                <Login 
                  onLogin={handleAuth} 
                  setIsSignup={setIsSignup} 
                />
              )
            }
          />
          <Route
            path="/auth/callback"
            element={<Callback onLogin={handleAuth} />}
          />
          {/* NEW ROUTE FOR SHARED FILES */}
          <Route
            path="/share/:shareToken"
            element={<SharedFile />}
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;