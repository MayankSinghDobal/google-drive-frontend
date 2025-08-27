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
} from "@mui/material"; // Correct import for MUI v7
import { motion } from "framer-motion";
import type { Item } from "../../types";

interface FileListProps {
  items: Item[];
  onShare: (id: number) => void;
}

const FileList: React.FC<FileListProps> = ({ items, onShare }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");

  const handlePreview = (item: Item) => {
    if (item.type === "file" && "publicUrl" in item && item.publicUrl) {
      if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(item.format)) {
        setPreviewType("image");
        setPreviewUrl(item.publicUrl);
        setPreviewOpen(true);
      } else if (item.format === "application/pdf") {
        setPreviewType("pdf");
        setPreviewUrl(item.publicUrl);
        setPreviewOpen(true);
      } else if (item.format === "text/plain") {
        setPreviewType("text");
        setPreviewUrl(item.publicUrl);
        setPreviewOpen(true);
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewType("");
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
      return "📄";
    }
    return "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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
                  cursor:
                    item.type === "file" &&
                    ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"].includes(item.format)
                      ? "pointer"
                      : "default",
                }}
                onClick={() => handlePreview(item)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{getFileIcon(item)}</span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.type === "file"
                      ? `${formatFileSize(item.size)} • ${item.format}`
                      : "Folder"}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>

                {item.type === "file" && (
                  <CardActions>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(item.id);
                      }}
                    >
                      Share
                    </Button>
                  </CardActions>
                )}
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogContent>
          {previewType === "image" && previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
          {previewType === "pdf" && previewUrl && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />
          )}
          {previewType === "text" && previewUrl && (
            <iframe
              src={previewUrl}
              title="Text Preview"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileList;
