import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { Download, Close } from "@mui/icons-material";
import axios from "axios";

interface SharedFileData {
  file: {
    id: number;
    name: string;
    size: number;
    format: string;
    signedUrl: string;
    created_at: string;
  };
  role: "view" | "edit";
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const SharedFile: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [fileData, setFileData] = useState<SharedFileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!shareToken) {
        setError("Invalid share token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/files/share/${shareToken}`);
        setFileData(response.data as SharedFileData);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load shared file");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [shareToken]);

  const handleDownload = () => {
    if (fileData?.file.signedUrl) {
      const link = document.createElement('a');
      link.href = fileData.file.signedUrl;
      link.download = fileData.file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (format: string) => {
    const f = format.toLowerCase();
    if (f.includes("image")) return "🖼️";
    if (f.includes("pdf")) return "📄";
    if (f.includes("text")) return "📝";
    if (f.includes("video")) return "🎥";
    if (f.includes("audio")) return "🎵";
    return "📄";
  };

  const canPreview = (format: string) => {
    const f = format.toLowerCase();
    return f.includes("image") || f === "application/pdf" || f.includes("text");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button href="/" variant="contained">
          Go to Home
        </Button>
      </Box>
    );
  }

  if (!fileData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>File not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 2 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span style={{ fontSize: "2rem" }}>{getFileIcon(fileData.file.format)}</span>
                  {fileData.file.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Size: {formatFileSize(fileData.file.size)} • Type: {fileData.file.format} • Permission: {fileData.role}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Created: {new Date(fileData.file.created_at).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        {canPreview(fileData.file.format) && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {fileData.file.format.toLowerCase().includes("image") && (
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <img
                    src={fileData.file.signedUrl}
                    alt={fileData.file.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      borderRadius: 4,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </Box>
              )}
              
              {fileData.file.format === "application/pdf" && (
                <iframe
                  src={fileData.file.signedUrl}
                  title="PDF Preview"
                  style={{ width: "100%", height: "80vh", border: "none" }}
                />
              )}
              
              {fileData.file.format.toLowerCase().includes("text") && (
                <iframe
                  src={fileData.file.signedUrl}
                  title="Text Preview"
                  style={{ width: "100%", height: "60vh", border: "none" }}
                />
              )}
            </CardContent>
          </Card>
        )}

        {!canPreview(fileData.file.format) && (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Preview not available for this file type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click download to view the file
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SharedFile;