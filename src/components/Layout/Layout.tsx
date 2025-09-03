import { AxiosProgressEvent } from "axios";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CssBaseline,
  CircularProgress,
  Typography,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import FileList from "../FileList/FileList";
import type { Item, Folder, User } from "../../types";
import {
  getFilesAndFolders,
  getUser,
  searchItems,
  uploadFile,
  shareFile,
  logout,
  createFolder,
} from "../../services/api";

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

const Layout: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading data for folder:", selectedFolder);

      // Load user and items
      const [userData, fetchedItems] = await Promise.all([
        getUser(),
        getFilesAndFolders(selectedFolder),
      ]);

      console.log("User data:", userData);
      console.log("Fetched items:", fetchedItems);

      setUser(userData);
      setItems(fetchedItems);
      setFolders(
        fetchedItems.filter((item: Item) => item.type === "folder") as Folder[]
      );
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(
        err.response?.data?.error || "Failed to load data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const searchResults = await searchItems(query);
        setItems(searchResults);
      } catch (err: any) {
        setSnackbar({
          open: true,
          message:
            err.response?.data?.error || "Search failed. Please try again.",
          severity: "error",
        });
      }
    } else {
      // Reload original data
      loadData();
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploadProgress(0);
      const file = files[0];

      const config = {
        onUploadProgress: (progressEvent: AxiosProgressEvent | ProgressEvent) => {
  const percent = Math.round(
    (((progressEvent as any).loaded ?? (progressEvent as any).bytes ?? 0) * 100) / ((progressEvent as any).total ?? 1)
  );
  setUploadProgress(percent);
},
      };

      await uploadFile(file, selectedFolder, config);

      setSnackbar({
        open: true,
        message: "File uploaded successfully!",
        severity: "success",
      });

      // Reload data
      await loadData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error || "Upload failed. Please try again.",
        severity: "error",
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setSnackbar({
        open: true,
        message: "Folder name is required.",
        severity: "error",
      });
      return;
    }

    try {
      await createFolder(newFolderName, selectedFolder);

      setSnackbar({
        open: true,
        message: "Folder created successfully!",
        severity: "success",
      });

      // Reload data
      await loadData();

      setFolderDialogOpen(false);
      setNewFolderName("");
    } catch (err: any) {
      console.error("Create folder error:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error ||
          "Folder creation failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleShare = async (id: number) => {
    try {
      const response = await shareFile(id, { role: 'view' });

      const shareLink = response.shareableLink;

      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareLink);
        setSnackbar({
          open: true,
          message: "Share link copied to clipboard!",
          severity: "success",
        });
      } catch (clipboardErr) {
        // Fallback: show link in a dialog or alert
        const userConfirmed = window.confirm(
          `Share link created! Click OK to copy:\n\n${shareLink}`
        );
        if (userConfirmed) {
          // Try manual selection
          const textArea = document.createElement("textarea");
          textArea.value = shareLink;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            setSnackbar({
              open: true,
              message: "Share link copied to clipboard!",
              severity: "success",
            });
          } catch (fallbackErr) {
            setSnackbar({
              open: true,
              message: `Share link created: ${shareLink}`,
              severity: "info",
            });
          }
          document.body.removeChild(textArea);
        }
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error || "Sharing failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setItems([]);
      setFolders([]);
      localStorage.removeItem("token");
      window.location.reload(); // Force reload to go back to login
    } catch (err: any) {
      console.error("Logout error:", err);
      // Force logout even if server request fails
      localStorage.removeItem("token");
      window.location.reload();
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleUpload(e.dataTransfer.files);
    },
    [selectedFolder]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Enhanced folder navigation with proper hierarchy
  const handleFolderClick = (item: Item) => {
    if (item.type === "folder") {
      setSelectedFolder(item.id);
      setSearchQuery(""); // Clear search when navigating
    }
  };
  // Add this function after the existing handleFolderClick:
  const handleItemClick = (item: Item) => {
    if (item.type === "folder") {
      setSelectedFolder(item.id);
      setSearchQuery(""); // Clear search when navigating
    }
  };

  const getBreadcrumbs = () => {
    const crumbs: { id: number | null; name: string }[] = [
      { id: null, name: "My Drive" },
    ];

    if (selectedFolder) {
      // Build path from current folder back to root
      let currentFolder = folders.find((f: Folder) => f.id === selectedFolder);
      const path: { id: number; name: string }[] = [];

      while (currentFolder) {
        path.unshift({ id: currentFolder.id, name: currentFolder.name });
        currentFolder = folders.find(
          (f: Folder) => f.id === currentFolder!.parent_id
        );
      }

      crumbs.push(...path);
    }

    return crumbs;
  };

  // Filter items based on current folder and search - FIXED LOGIC
  const filteredItems = items.filter((item: Item) => {
    // Apply search filter first
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    // Apply folder filter when not searching
    if (selectedFolder === null) {
      // Show root level items
      return item.type === "file"
        ? item.folder_id === null || item.folder_id === undefined
        : item.parent_id === null || item.parent_id === undefined;
    } else {
      // Show items in selected folder
      return item.type === "file"
        ? item.folder_id === selectedFolder
        : item.parent_id === selectedFolder;
    }
  });

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={loadData} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Sidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={(folderId) => {
            setSelectedFolder(folderId);
            setSearchQuery(""); // Clear search when navigating via sidebar
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <TopBar
            onSearch={handleSearch}
            onUpload={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.onchange = (e: Event) =>
                handleUpload((e.target as HTMLInputElement).files);
              input.click();
            }}
            user={user}
            onLogout={handleLogout}
          />

          <Box sx={{ p: 2 }}>
            <Breadcrumbs>
              {getBreadcrumbs().map((crumb, index) => (
                <Link
                  key={crumb.id ?? "root"}
                  underline="hover"
                  color={
                    index === getBreadcrumbs().length - 1
                      ? "text.primary"
                      : "inherit"
                  }
                  onClick={() => {
                    setSelectedFolder(crumb.id);
                    setSearchQuery(""); // Clear search when using breadcrumbs
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  {crumb.name}
                </Link>
              ))}
            </Breadcrumbs>

            <Button
              variant="contained"
              onClick={() => setFolderDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              New Folder
            </Button>
          </Box>

          <Box
            sx={{
              border: isDragging ? "2px dashed #4285f4" : "1px dashed #ccc",
              p: 2,
              m: 2,
              borderRadius: 1,
              backgroundColor: isDragging ? "#e3f2fd" : "inherit",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Typography
              sx={{
                textAlign: "center",
                color: isDragging ? "#4285f4" : "inherit",
              }}
            >
              {isDragging
                ? "Drop files here"
                : "Drag and drop files here or click Upload"}
            </Typography>

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography>Upload Progress: {uploadProgress}%</Typography>
                <Box
                  sx={{
                    width: "100%",
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${uploadProgress}%`,
                      bgcolor: "#4285f4",
                      height: 8,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <FileList
            items={filteredItems}
            folders={folders}
            onShare={handleShare}
            onRefresh={loadData}
            currentFolder={selectedFolder}
            onItemClick={(item) => {
              if (item.type === "folder") {
                setSelectedFolder(item.id);
                setSearchQuery(""); // Clear search when navigating
              }
            }}
          />

          <Dialog
            open={folderDialogOpen}
            onClose={() => {
              setFolderDialogOpen(false);
              setNewFolderName("");
            }}
          >
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogContent>
              <TextField
                label="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                fullWidth
                margin="normal"
                required
                autoFocus
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setFolderDialogOpen(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                variant="contained"
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;