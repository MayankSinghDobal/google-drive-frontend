import React, { useState } from "react";
import { getFileTypeInfo, canPreviewFile, getOpenWithOptions } from "../../utils/fileTypes";
import PreviewDialog from "../Preview/PreviewDialog";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Box,
  Menu,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Close,
  Share,
  Download,
  MoreVert,
  Delete,
  Edit,
  DriveFileMove,
  ContentCut,
  ContentCopy,
  Folder,
  OpenInNew,
  Launch,
  CloudDownload,
  Info,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { Item, Folder as FolderType } from "../../types";
import {
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
  moveFile,
  moveFolder,
  downloadFile,
  downloadFileWithFetch,
} from "../../services/api";

interface FileListProps {
  items: Item[];
  folders: FolderType[];
  onShare: (id: number) => void;
  onRefresh: () => Promise<void>;
  currentFolder: number | null;
  onItemClick: (item: Item) => void;
}

const FileList: React.FC<FileListProps> = ({
  items,
  folders,
  onShare,
  onRefresh,
  currentFolder,
  onItemClick,
}) => {
  const [previewItem, setPreviewItem] = useState<Item | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openWithDialogOpen, setOpenWithDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Download state
  const [downloadProgress, setDownloadProgress] = useState<{ [key: number]: number }>({});

  // Clipboard state
  const [clipboardItems, setClipboardItems] = useState<
    { id: number; type: "file" | "folder"; operation: "copy" | "cut" }[]
  >([]);

  // Form states
  const [newName, setNewName] = useState("");
  const [targetFolder, setTargetFolder] = useState<string | null>("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    item: Item
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handlePreview = (item: Item) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  // Enhanced download function with progress
  const handleDownload = async (item: Item) => {
    if (item.type === "file") {
      try {
        setError(null);
        setDownloadProgress(prev => ({ ...prev, [item.id]: 0 }));
        
        await downloadFileWithFetch(item.id, (progress) => {
          setDownloadProgress(prev => ({ ...prev, [item.id]: progress }));
        });
        
        // Clear progress after a short delay
        setTimeout(() => {
          setDownloadProgress(prev => {
            const updated = { ...prev };
            delete updated[item.id];
            return updated;
          });
        }, 2000);
      } catch (error) {
        console.error("Download failed:", error);
        setError("Download failed. Please try again.");
        setDownloadProgress(prev => {
          const updated = { ...prev };
          delete updated[item.id];
          return updated;
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedItem.type === "file") {
        await deleteFile(selectedItem.id);
      } else {
        await deleteFolder(selectedItem.id);
      }

      await onRefresh();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setError(error.response?.data?.error || "Delete failed. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleRename = async () => {
    if (!selectedItem || !newName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedItem.type === "file") {
        await renameFile(selectedItem.id, newName.trim());
      } else {
        await renameFolder(selectedItem.id, newName.trim());
      }

      await onRefresh();
      setRenameDialogOpen(false);
      setNewName("");
    } catch (error: any) {
      console.error("Rename failed:", error);
      setError(error.response?.data?.error || "Rename failed. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleMove = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      setError(null);

      const folderId = !targetFolder ? null : Number(targetFolder);

      if (selectedItem.type === "file") {
        await moveFile(selectedItem.id, folderId);
      } else {
        await moveFolder(selectedItem.id, folderId);
      }

      await onRefresh();
      setMoveDialogOpen(false);
      setTargetFolder("");
    } catch (error: any) {
      console.error("Move failed:", error);
      setError(error.response?.data?.error || "Move failed. Please try again.");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleCopy = (item: Item | null) => {
    if (!item) return;
    setClipboardItems([{ id: item.id, type: item.type, operation: "copy" }]);
    handleMenuClose();
    console.log("Copied:", item.name);
  };

  const handleCut = (item: Item | null) => {
    if (!item) return;
    setClipboardItems([{ id: item.id, type: item.type, operation: "cut" }]);
    handleMenuClose();
    console.log("Cut:", item.name);
  };

  const handleOpenWith = (application: string) => {
    if (!selectedItem || selectedItem.type !== "file") return;
    
    // For web-based applications, open in new tab
    const webApps = ['Browser', 'Chrome', 'Firefox', 'Edge', 'Safari'];
    if (webApps.includes(application) && 'publicUrl' in selectedItem && selectedItem.publicUrl) {
      window.open(selectedItem.publicUrl, '_blank');
      setOpenWithDialogOpen(false);
      handleMenuClose();
      return;
    }
    
    // For other applications, show instructions or attempt to open
    if (application === 'System Default') {
      // Try to trigger system default handler
      const link = document.createElement('a');
      link.href = selectedItem.publicUrl || '';
      link.download = selectedItem.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Show instructions for desktop applications
      alert(`To open with ${application}:\n1. Download the file\n2. Right-click and select "Open with ${application}"\n3. Or drag the file to ${application}`);
    }
    
    setOpenWithDialogOpen(false);
    handleMenuClose();
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const getFileIcon = (item: Item) => {
    if (item.type === "folder") {
      return "📁";
    }
    return getFileTypeInfo(item.format).icon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const canPreview = (item: Item) => {
    return item.type === "file" && canPreviewFile(item.format);
  };

  const getAvailableFolders = () => {
    const available = folders.filter((folder) => {
      if (selectedItem?.type === "folder" && folder.id === selectedItem.id)
        return false;
      return true;
    });
    return available;
  };

  if (items.length === 0) {
    return (
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          p: 4,
        }}
      >
        No files or folders found
      </Typography>
    );
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ p: 2 }}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
                onClick={() => {
                  if (item.type === "folder") {
                    onItemClick(item);
                  } else if (canPreview(item)) {
                    handlePreview(item);
                  }
                }}
              >
                {downloadProgress[item.id] !== undefined && (
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={downloadProgress[item.id]}
                      sx={{ height: 3 }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "1rem",
                        fontWeight: 500,
                        mb: 1,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {getFileIcon(item)}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(e, item);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {item.type === "file"
                      ? `${formatFileSize(item.size)} • ${getFileTypeInfo(item.format).category}`
                      : "Folder"}
                  </Typography>

                  {item.type === "file" && (
                    <Chip
                      label={getFileTypeInfo(item.format).category}
                      size="small"
                      sx={{
                        backgroundColor: getFileTypeInfo(item.format).color + "20",
                        color: getFileTypeInfo(item.format).color,
                        mb: 1,
                      }}
                    />
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", pt: 0 }}>
                  {item.type === "file" && (
                    <>
                      <Button
                        size="small"
                        startIcon={<Share />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(item.id);
                        }}
                      >
                        Share
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CloudDownload />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        disabled={downloadProgress[item.id] !== undefined}
                      >
                        {downloadProgress[item.id] !== undefined
                          ? `${downloadProgress[item.id]}%`
                          : "Download"}
                      </Button>
                    </>
                  )}
                  {item.type === "folder" && (
                    <Typography variant="caption" color="text.secondary">
                      Click to view contents
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 },
        }}
      >
        {selectedItem?.type === "file" && (
          <MenuItem onClick={() => handleDownload(selectedItem)}>
            <ListItemIcon>
              <Download />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}

        {selectedItem?.type === "file" && canPreview(selectedItem) && (
          <MenuItem onClick={() => handlePreview(selectedItem)}>
            <ListItemIcon>
              <OpenInNew />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
        )}

        {selectedItem?.type === "file" && (
          <MenuItem
            onClick={() => {
              setOpenWithDialogOpen(true);
            }}
          >
            <ListItemIcon>
              <Launch />
            </ListItemIcon>
            <ListItemText>Open with...</ListItemText>
          </MenuItem>
        )}

        {selectedItem?.type === "file" && (
          <MenuItem onClick={() => onShare(selectedItem.id)}>
            <ListItemIcon>
              <Share />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem
          onClick={() => {
            setNewName(selectedItem?.name || "");
            setRenameDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setTargetFolder(currentFolder?.toString() || "");
            setMoveDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <DriveFileMove />
          </ListItemIcon>
          <ListItemText>Move</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleCopy(selectedItem)}>
          <ListItemIcon>
            <ContentCopy />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleCut(selectedItem)}>
          <ListItemIcon>
            <ContentCut />
          </ListItemIcon>
          <ListItemText>Cut</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => setInfoDialogOpen(true)}
        >
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText>Properties</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <Delete />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Enhanced Preview Dialog */}
      <PreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        item={previewItem}
        onDownload={handleDownload}
      />

      {/* Open With Dialog */}
      <Dialog
        open={openWithDialogOpen}
        onClose={() => setOpenWithDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Open "{selectedItem?.name}" with...
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose an application to open this file:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {selectedItem?.type === "file" &&
              getOpenWithOptions(selectedItem.format).map((app, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleOpenWith(app)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                >
                  <Launch sx={{ mr: 1 }} />
                  {app}
                </Button>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Properties/Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Properties - {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">Type:</Typography>
                <Typography variant="body2">
                  {selectedItem.type === "file"
                    ? `${getFileTypeInfo(selectedItem.format).category} (${selectedItem.format})`
                    : "Folder"}
                </Typography>
              </Box>
              
              {selectedItem.type === "file" && (
                <Box>
                  <Typography variant="subtitle2">Size:</Typography>
                  <Typography variant="body2">
                    {formatFileSize(selectedItem.size)}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2">Created:</Typography>
                <Typography variant="body2">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">Location:</Typography>
                <Typography variant="body2">
                  {currentFolder ? "Current Folder" : "My Drive"}
                </Typography>
              </Box>

              {selectedItem.type === "file" && 'publicUrl' in selectedItem && (
                <Box>
                  <Typography variant="subtitle2">Preview Available:</Typography>
                  <Typography variant="body2">
                    {canPreview(selectedItem) ? "Yes" : "No"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Rename {selectedItem?.type === "file" ? "File" : "Folder"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRename}
            disabled={!newName.trim() || loading}
            variant="contained"
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Dialog */}
      <Dialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Move {selectedItem?.type === "file" ? "File" : "Folder"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Destination Folder</InputLabel>
            <Select
              value={targetFolder || ""}
              onChange={(e) =>
                setTargetFolder(
                  e.target.value === "" ? null : String(e.target.value)
                )
              }
              label="Destination Folder"
            >
              <MenuItem value="">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Folder />
                  Root (My Drive)
                </Box>
              </MenuItem>
              {getAvailableFolders().map((folder) => (
                <MenuItem key={folder.id} value={folder.id.toString()}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Folder />
                    {folder.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMove} disabled={loading} variant="contained">
            Move
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>
          Delete {selectedItem?.type === "file" ? "File" : "Folder"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.name}"? This action
            cannot be undone.
          </Typography>
          {selectedItem?.type === "folder" && (
            <Typography color="warning.main" sx={{ mt: 1 }}>
              Warning: This folder must be empty before it can be deleted.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileList;