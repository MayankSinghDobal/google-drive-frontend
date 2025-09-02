import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { 
  Close, 
  Download, 
  OpenInNew, 
  Launch,
  CloudDownload,
  ZoomIn,
  ZoomOut,
  FullscreenExit,
  Fullscreen
} from "@mui/icons-material";
import type { Item } from "../../types";
import { getFileTypeInfo, getPreviewType, getOpenWithOptions } from "../../utils/fileTypes";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  onDownload: (item: Item) => void;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  item,
  onDownload,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  if (!item || item.type !== "file") return null;

  const fileInfo = getFileTypeInfo(item.format);
  const previewType = getPreviewType(item.format);

  const handleDownload = async () => {
    try {
      setLoading(true);
      await onDownload(item);
    } catch (error) {
      setError("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const renderPreviewContent = () => {
    if (!item.publicUrl) {
      return (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Preview not available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              File URL not accessible
            </Typography>
          </CardContent>
        </Card>
      );
    }

    switch (previewType) {
      case 'image':
        return (
          <Box sx={{ textAlign: "center", p: 2, position: "relative" }}>
            {/* Image Controls */}
            <Box sx={{ 
              position: "absolute", 
              top: 8, 
              right: 8, 
              display: "flex", 
              gap: 1,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 1,
              p: 1
            }}>
              <IconButton size="small" onClick={handleZoomOut} sx={{ color: "white" }}>
                <ZoomOut />
              </IconButton>
              <Typography variant="caption" sx={{ color: "white", alignSelf: "center", px: 1 }}>
                {zoom}%
              </Typography>
              <IconButton size="small" onClick={handleZoomIn} sx={{ color: "white" }}>
                <ZoomIn />
              </IconButton>
              <IconButton size="small" onClick={resetZoom} sx={{ color: "white" }}>
                Reset
              </IconButton>
              <IconButton size="small" onClick={toggleFullscreen} sx={{ color: "white" }}>
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>

            <img
              src={item.publicUrl}
              alt={item.name}
              style={{
                maxWidth: "100%",
                maxHeight: fullscreen ? "90vh" : "70vh",
                objectFit: "contain",
                borderRadius: 4,
                transform: `scale(${zoom / 100})`,
                transition: "transform 0.3s ease",
              }}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
              }}
            />
          </Box>
        );

      case 'pdf':
        return (
          <Box sx={{ position: "relative" }}>
            <iframe
              src={`${item.publicUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
              title="PDF Preview"
              style={{ 
                width: "100%", 
                height: fullscreen ? "90vh" : "70vh", 
                border: "none",
                borderRadius: 4
              }}
              onError={() => {
                setError("Failed to load PDF preview");
              }}
            />
            <Box sx={{ 
              position: "absolute", 
              top: 8, 
              right: 8,
              display: "flex",
              gap: 1
            }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => window.open(item.publicUrl, '_blank')}
                startIcon={<OpenInNew />}
              >
                Open in New Tab
              </Button>
            </Box>
          </Box>
        );

      case 'text':
        return (
          <Box sx={{ position: "relative" }}>
            <iframe
              src={item.publicUrl}
              title="Text Preview"
              style={{ 
                width: "100%", 
                height: fullscreen ? "80vh" : "60vh", 
                border: "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: "white"
              }}
              onError={() => {
                setError("Failed to load text preview");
              }}
            />
            <Box sx={{ 
              position: "absolute", 
              top: 8, 
              right: 8,
              display: "flex",
              gap: 1
            }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => window.open(item.publicUrl, '_blank')}
                startIcon={<OpenInNew />}
              >
                View Raw
              </Button>
            </Box>
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ p: 2 }}>
            <video
              controls
              style={{ 
                width: "100%", 
                maxHeight: fullscreen ? "80vh" : "60vh",
                borderRadius: 4
              }}
              onError={() => {
                setError("Failed to load video");
              }}
            >
              <source src={item.publicUrl} type={item.format} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case 'audio':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <span style={{ fontSize: "2rem" }}>{fileInfo.icon}</span>
              {item.name}
            </Typography>
            <audio
              controls
              style={{ 
                width: "100%", 
                maxWidth: "500px",
                marginBottom: 16
              }}
              onError={() => {
                setError("Failed to load audio");
              }}
            >
              <source src={item.publicUrl} type={item.format} />
              Your browser does not support the audio tag.
            </audio>
            <Box>
              <Chip 
                label={fileInfo.category}
                sx={{ 
                  backgroundColor: fileInfo.color + "20",
                  color: fileInfo.color 
                }}
              />
            </Box>
          </Box>
        );

      case 'office':
        return (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {fileInfo.icon}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {fileInfo.category} File
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Preview not available in browser for {fileInfo.category} files
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<CloudDownload />}
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : "Download to View"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Launch />}
                  onClick={() => {
                    const openWithOptions = getOpenWithOptions(item.format);
                    if (openWithOptions.length > 0) {
                      const message = `Recommended applications to open this file:\n\n${openWithOptions.join('\n')}\n\nDownload the file and open with one of these applications.`;
                      alert(message);
                    }
                  }}
                >
                  View Open With Options
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {fileInfo.icon}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Preview not available for {fileInfo.category} files
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Download the file to view its contents
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<CloudDownload />}
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : "Download"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  onClick={() => window.open(item.publicUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
                {getOpenWithOptions(item.format).length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Launch />}
                    onClick={() => {
                      const openWithOptions = getOpenWithOptions(item.format);
                      const message = `Recommended applications:\n\n${openWithOptions.join('\n')}`;
                      alert(message);
                    }}
                  >
                    Show Applications
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          maxHeight: fullscreen ? "100vh" : "90vh",
          height: fullscreen ? "100vh" : "fit-content",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{fileInfo.icon}</span>
            {item.name}
          </Typography>
          <Chip 
            label={fileInfo.category}
            size="small"
            sx={{ 
              backgroundColor: fileInfo.color + "20",
              color: fileInfo.color 
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {previewType !== 'none' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CloudDownload />}
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? <CircularProgress size={16} /> : "Download"}
            </Button>
          )}
          {fullscreen && (
            <IconButton onClick={toggleFullscreen}>
              <FullscreenExit />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, overflow: fullscreen ? "auto" : "hidden" }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {renderPreviewContent()}
      </DialogContent>

      {/* Footer with file info */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: "divider",
        backgroundColor: "background.paper",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Size: {((item.size / 1024 / 1024)).toFixed(2)} MB • 
            Format: {item.format} • 
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        {previewType === 'image' && (
          <Typography variant="caption" color="text.secondary">
            Use mouse wheel or zoom controls to adjust size
          </Typography>
        )}
      </Box>
    </Dialog>
  );
};

export default PreviewDialog;