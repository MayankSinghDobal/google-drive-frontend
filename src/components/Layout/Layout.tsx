// 3. Fixed Layout.tsx - Proper type checking for filtering
import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import FileList from "../FileList/FileList";
import type { Item, Folder, User } from "../../types";

const theme = createTheme({
  palette: {
    primary: { main: "#4285f4" }, // Google blue
    secondary: { main: "#fbbc05" }, // Google yellow
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

const Layout: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user] = useState<User | null>({
    id: 1,
    name: "Test User",
    email: "test@example.com",
  });

  // Placeholder data (replace with API calls later)
  const folders: Folder[] = [
    {
      id: 1,
      name: "Documents",
      user_id: 1,
      parent_id: null,
      created_at: "2025-08-24",
      type: "folder",
    },
    {
      id: 2,
      name: "Work",
      user_id: 1,
      parent_id: 1,
      created_at: "2025-08-24",
      type: "folder",
    },
  ];
  
  const items: Item[] = [
    {
      id: 1,
      name: "Resume.pdf",
      size: 1024,
      format: "application/pdf",
      path: "files/resume.pdf",
      user_id: 1,
      folder_id: null,
      created_at: "2025-08-24",
      type: "file",
      publicUrl: "",
    },
    {
      id: 2,
      name: "Photo.jpg",
      size: 2048,
      format: "image/jpeg",
      path: "files/photo.jpg",
      user_id: 1,
      folder_id: 1,
      created_at: "2025-08-24",
      type: "file",
      publicUrl: "",
    },
    {
      id: 3,
      name: "Notes",
      user_id: 1,
      parent_id: null,
      created_at: "2025-08-24",
      type: "folder",
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Add API call to /search?query= later
  };

  const handleUpload = () => {
    alert("Upload clicked (to be implemented)");
  };

  const handleShare = (id: number) => {
    alert(`Share item ${id} clicked (to be implemented)`);
  };

  const handleLogout = () => {
    alert("Logout clicked (to be implemented)");
  };

  // Fixed filtering logic
  const filteredItems = items.filter((item) => {
    // Check folder filter
    const folderMatch = selectedFolder === null || 
      (item.type === "file" && item.folder_id === selectedFolder) ||
      (item.type === "folder" && item.parent_id === selectedFolder);
    
    // Check search filter
    const searchMatch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return folderMatch && searchMatch;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Sidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
        />
        <Box sx={{ flexGrow: 1 }}>
          <TopBar
            onSearch={handleSearch}
            onUpload={handleUpload}
            user={user}
            onLogout={handleLogout}
          />
          <FileList
            items={filteredItems}
            onShare={handleShare}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;