import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import type { User } from "../../types";

const theme = createTheme({
  palette: {
    primary: { main: "#4285f4" },
    secondary: { main: "#fbbc05" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

interface LoginProps {
  onLogin: (user: User) => void;
  setIsSignup: (value: boolean) => void;
}

interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const Login: React.FC<LoginProps> = ({ onLogin, setIsSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${API_BASE_URL}/ping`);
      
      const response = await axios.get(`${API_BASE_URL}/ping`, {
        timeout: 10000,
        withCredentials: true,
      });
      
      console.log("Connection test successful:", response.data);
      setConnectionStatus('connected');
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Connection test failed:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      setConnectionStatus('failed');
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError(`Cannot connect to server. Please ensure the backend is running.`);
      } else if (err.response?.status === 0) {
        setError('CORS error: Backend server is not allowing requests from this origin');
      } else {
        setError(`Connection test failed: ${err.message}`);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    const isConnected = await testConnection();
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 15000,
        }
      );

      console.log("Login successful:", response.data);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin(user);
    } catch (err: any) {
      console.error("Login error:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 0) {
        setError('CORS error: Please check server configuration');
      } else {
        setError(err.response?.data?.error || "Login failed: Please check your credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    
    const isConnected = await testConnection();
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting Google login to:", `${API_BASE_URL}/auth/google`);

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/google`,
        { token: credentialResponse.credential },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 15000,
        }
      );

      console.log("Google login successful:", response.data);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin(user);
    } catch (err: any) {
      console.error("Google login error:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (err.response?.status === 0) {
        setError('CORS error: Please check server configuration');
      } else {
        setError(err.response?.data?.error || "Google login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Server Connected';
      case 'failed': return '❌ Server Disconnected';
      default: return '🔄 Testing Connection...';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
          <Typography variant="h4" gutterBottom align="center">
            Login to Google Drive Clone
          </Typography>

          <Alert 
            severity={getConnectionStatusColor()} 
            sx={{ mb: 2 }}
          >
            {getConnectionStatusText()}
            <br />
            <Typography variant="caption">
              API URL: {API_BASE_URL}
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            onClick={testConnection}
            sx={{ mb: 2, width: '100%' }}
            size="small"
            disabled={loading}
          >
            Test Server Connection
          </Button>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading || connectionStatus === 'failed'}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading || connectionStatus === 'failed'}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading || connectionStatus === 'failed'}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {connectionStatus === 'connected' ? (
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Google login failed")}
                  useOneTap={false}
                  auto_select={false}
                  ux_mode="popup"
                  context="signin"
                  size="large"
                  theme="outline"
                />
              ) : (
                <Alert severity="warning" sx={{ width: '100%' }}>
                  Google login requires server connection
                </Alert>
              )}
            </Box>

            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setIsSignup(true)}
              disabled={loading}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;