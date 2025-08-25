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

interface SignupProps {
  onSignup: (user: User) => void;
  setIsSignup: (value: boolean) => void;
}

interface SignupResponse {
  token: string;
  user: User;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const Signup: React.FC<SignupProps> = ({ onSignup, setIsSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/auth/signup`);
      
      const response = await axios.post<SignupResponse>(
        `${API_BASE_URL}/auth/signup`,
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      console.log('Signup successful:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onSignup(user);
    } catch (err: any) {
      console.error('Signup error:', err);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.error || "Signup failed");
      } else if (err.request) {
        // Network error
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Google Drive Clone - Signup
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          API URL: {API_BASE_URL}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ maxWidth: 400, width: "100%" }}
        >
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
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
            helperText="Password must be at least 6 characters"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
          
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setIsSignup(false)}
            disabled={loading}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Signup;