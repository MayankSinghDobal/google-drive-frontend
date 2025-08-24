import React from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  Button,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { Search, CloudUpload, Logout } from "@mui/icons-material";
import { motion } from "framer-motion";

interface TopBarProps {
  onSearch: (query: string) => void;
  onUpload: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onSearch,
  onUpload,
  user,
  onLogout,
}) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Google Drive Clone
        </Typography>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search files and folders"
            InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            onChange={(e) => onSearch(e.target.value)}
            sx={{ mr: 2, width: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={onUpload}
            sx={{ mr: 2 }}
          >
            Upload
          </Button>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ mr: 1 }}>{user.name[0]}</Avatar>
              <Typography variant="body2">{user.name}</Typography>
              <Button startIcon={<Logout />} onClick={onLogout} sx={{ ml: 1 }}>
                Logout
              </Button>
            </Box>
          )}
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
