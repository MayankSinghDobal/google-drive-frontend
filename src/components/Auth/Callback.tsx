import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import type { User } from "../../types";

const Callback: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = params.get("user");
    if (token && user) {
      localStorage.setItem("token", token);
      onLogin(JSON.parse(decodeURIComponent(user)));
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate, onLogin]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default Callback;
