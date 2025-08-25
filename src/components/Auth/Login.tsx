import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
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

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`, {
        withCredentials: true,
      });
      console.log("Connection test successful:", response.data);
      return true;
    } catch (err: any) {
      console.error("Connection test failed:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      setError(`Connection test failed: ${err.message}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      console.log('Login successful:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Login failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      console.log('Attempting Google login to:', `${API_BASE_URL}/auth/google`);
      
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/google`,
        { token: credentialResponse.credential },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      console.log('Google login successful:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLogin(user);
    } catch (err: any) {
      console.error('Google login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || "Google login failed: Network error");
    } finally {
      setLoading(false);
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
      />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Login to Google Drive Clone
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            API URL: {API_BASE_URL}
          </Typography>
          
          <Button
            variant="outlined"
            onClick={testConnection}
            sx={{ mb: 2 }}
            size="small"
          >
            Test Connection
          </Button>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, width: "100%" }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={loading}
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.error("Google login failed");
                  setError("Google login failed. Please try again.");
                }}
                useOneTap
              />
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
        </Box>
      </ThemeProvider>
    );
};

export default Login;