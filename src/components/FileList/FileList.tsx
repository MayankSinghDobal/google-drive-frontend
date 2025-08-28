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
} from "@mui/material";
import { Close, Share, Download } from "@mui/icons-material";
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
  const [previewName, setPreviewName] = useState<string>("");

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
        // For other file types, try to download
        const link = document.createElement('a');
        link.href = item.publicUrl;
        link.download = item.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleDownload = (item: Item) => {
    if (item.type === "file" && "publicUrl" in item && item.publicUrl) {
      const link = document.createElement('a');
      link.href = item.publicUrl;
      link.download = item.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      if (format.includes("powerpoint") || format.includes("presentation")) return "📈";
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

  const canPreview = (item: Item) => {
    if (item.type !== "file") return false;
    const format = item.format.toLowerCase();
    return format.includes("image") || 
           format === "application/pdf" || 
           format.includes("text");
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
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
                onClick={() => canPreview(item) && handlePreview(item)}
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
                      mb: 1,
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{getFileIcon(item)}</span>
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

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                          handleDownload(item);
                        }}
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

      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: 'fit-content',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {previewName}
          </Typography>
          <IconButton onClick={handleClosePreview}>
            <Close />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          {previewType === "image" && previewUrl && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
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
                  console.error('Image load error for:', previewUrl);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
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
                console.error('PDF load error for:', previewUrl);
              }}
            />
          )}
          {previewType === "text" && previewUrl && (
            <iframe
              src={previewUrl}
              title="Text Preview"
              style={{ width: "100%", height: "70vh", border: "none" }}
              onError={() => {
                console.error('Text file load error for:', previewUrl);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileList;