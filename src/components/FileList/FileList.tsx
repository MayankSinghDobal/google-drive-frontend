import React, { useState } from "react";
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
  getSecureDownloadUrl,
} from "../../services/api";

interface FileListProps {
  items: Item[];
  folders: FolderType[];
  onShare: (id: number) => void;
  onRefresh: () => Promise<void>;
  currentFolder: number | null;
}

const FileList: React.FC<FileListProps> = ({
  items,
  folders,
  onShare,
  onRefresh,
  currentFolder,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [targetFolder, setTargetFolder] = useState<string | null>("");

  // Loading states
  const [loading, setLoading] = useState(false);

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
    if (item.type === "file" && "publicUrl" in item && item.publicUrl) {
      const format = item.format.toLowerCase();

      if (format.includes("image")) {
        setPreviewType("image");
        setPreviewUrl(item.publicUrl);
        setPreviewName(item.name);
        setPreviewOpen(true);
      } else if (format === "application/pdf") {
        setPreviewType("pdf");
        setPreviewUrl(item.publicUrl);
        setPreviewName(item.name);
        setPreviewOpen(true);
      } else if (format.includes("text")) {
        setPreviewType("text");
        setPreviewUrl(item.publicUrl);
        setPreviewName(item.name);
        setPreviewOpen(true);
      } else {
        handleSecureDownload(item);
      }
    }
  };

  const handleSecureDownload = async (item: Item) => {
    if (item.type === "file") {
      try {
        setLoading(true);
        const { signedUrl, fileName } = await getSecureDownloadUrl(item.id);

        const link = document.createElement("a");
        link.href = signedUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
        // Fallback to publicUrl if secure download fails
        if ("publicUrl" in item && item.publicUrl) {
          const link = document.createElement("a");
          link.href = item.publicUrl;
          link.download = item.name;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);

      if (selectedItem.type === "file") {
        await deleteFile(selectedItem.id);
      } else {
        await deleteFolder(selectedItem.id);
      }

      await onRefresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleRename = async () => {
    if (!selectedItem || !newName.trim()) return;

    try {
      setLoading(true);

      if (selectedItem.type === "file") {
        await renameFile(selectedItem.id, newName.trim());
      } else {
        await renameFolder(selectedItem.id, newName.trim());
      }

      await onRefresh();
      setRenameDialogOpen(false);
      setNewName("");
    } catch (error) {
      console.error("Rename failed:", error);
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleMove = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);

      // Convert targetFolder from string to number or null
      const folderId = !targetFolder ? null : Number(targetFolder);

      if (selectedItem.type === "file") {
        await moveFile(selectedItem.id, folderId);
      } else {
        await moveFolder(selectedItem.id, folderId);
      }

      await onRefresh();
      setMoveDialogOpen(false);
      setTargetFolder("");
    } catch (error) {
      console.error("Move failed:", error);
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewType("");
    setPreviewName("");
  };

  const getFileIcon = (item: Item) => {
    if (item.type === "folder") {
      return "📁";
    }
    if (item.type === "file") {
      const format = item.format.toLowerCase();
      if (format.includes("image")) return "🖼️";
      if (format.includes("pdf")) return "📄";
      if (format.includes("text")) return "📝";
      if (format.includes("video")) return "🎥";
      if (format.includes("audio")) return "🎵";
      if (format.includes("zip") || format.includes("rar")) return "📦";
      if (format.includes("word") || format.includes("doc")) return "📃";
      if (format.includes("excel") || format.includes("sheet")) return "📊";
      if (format.includes("powerpoint") || format.includes("presentation"))
        return "📈";
      return "📄";
    }
    return "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const canPreview = (item: Item) => {
    if (item.type !== "file") return false;
    const format = item.format.toLowerCase();
    return (
      format.includes("image") ||
      format === "application/pdf" ||
      format.includes("text")
    );
  };

  // Get available folders for move operation (exclude current folder and item itself)
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
                  cursor: canPreview(item) ? "pointer" : "default",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
                onClick={() => canPreview(item) && handlePreview(item)}
              >
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
                      ? `${formatFileSize(item.size)} • ${item.format}`
                      : "Folder"}
                  </Typography>

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
                        startIcon={<Download />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSecureDownload(item);
                        }}
                        disabled={loading}
                      >
                        Download
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 },
        }}
      >
        {selectedItem?.type === "file" && (
          <MenuItem
            onClick={() => handleSecureDownload(selectedItem)}
            disabled={loading}
          >
            <ListItemIcon>
              <Download />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
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

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            height: "fit-content",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {previewName}
          </Typography>
          <IconButton onClick={handleClosePreview}>
            <Close />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          {previewType === "image" && previewUrl && (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 4,
                }}
                onError={(e) => {
                  console.error("Image load error for:", previewUrl);
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                }}
              />
            </Box>
          )}

          {previewType === "pdf" && previewUrl && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "70vh", border: "none" }}
              onError={() => {
                console.error("PDF load error for:", previewUrl);
              }}
            />
          )}

          {previewType === "text" && previewUrl && (
            <iframe
              src={previewUrl}
              title="Text Preview"
              style={{ width: "100%", height: "70vh", border: "none" }}
              onError={() => {
                console.error("Text file load error for:", previewUrl);
              }}
            />
          )}
        </DialogContent>
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
