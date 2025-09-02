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
  Chip,
  Paper,
  Divider,
  Grid,
  Container,
} from "@mui/material";
import { 
  Download, 
  Visibility, 
  Edit, 
  Schedule, 
  Security,
  Error as ErrorIcon,
  CheckCircle,
  Info
} from "@mui/icons-material";
import axios from "axios";

interface SharedFileData {
  file: {
    id: number;
    name: string;
    size: number;
    format: string;
    publicUrl?: string;
    created_at: string;
  };
  permissions: {
    role: "view" | "edit";
    can_download: boolean;
    can_preview: boolean;
    expires_at: string | null;
    access_count: number;
    max_access_count: number | null;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const SharedFile: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [fileData, setFileData] = useState<SharedFileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!shareToken) {
        setError("Invalid share token");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching shared file: ${shareToken}`);
        const response = await axios.get(
          `${API_BASE_URL}/files/share/${shareToken}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: false,
          }
        );
        
        console.log('Shared file response:', response.data);
        setFileData(response.data as SharedFileData);
      } catch (err: any) {
        console.error('Shared file fetch error:', err);
        setError(err.response?.data?.error || "Failed to load shared file");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [shareToken]);

  const handleDownload = async () => {
    if (!fileData?.permissions.can_download || !shareToken) {
      setError("Download not allowed");
      return;
    }

    try {
      setDownloading(true);
      setError(null);

      console.log(`Downloading shared file: ${shareToken}`);
      
      const response = await axios.get(
        `${API_BASE_URL}/files/share/${shareToken}/download`,
        {
          responseType: 'blob',
          headers: {
            "Accept": "*/*",
          },
          withCredentials: false,
        }
      );

      // Fixed: Proper Blob creation with typed data
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileData.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Download completed successfully');
    } catch (err: any) {
      console.error('Download failed:', err);
      setError(err.response?.data?.error || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (format: string) => {
    const f = format.toLowerCase();
    if (f.includes("image")) return "🖼️";
    if (f.includes("pdf")) return "📄";
    if (f.includes("text")) return "📝";
    if (f.includes("video")) return "🎥";
    if (f.includes("audio")) return "🎵";
    if (f.includes("zip") || f.includes("rar")) return "📦";
    if (f.includes("word") || f.includes("doc")) return "📘";
    if (f.includes("excel") || f.includes("sheet")) return "📊";
    if (f.includes("powerpoint") || f.includes("presentation")) return "📊";
    return "📄";
  };

  const canPreview = (format: string) => {
    const f = format.toLowerCase();
    return f.includes("image") || 
           f === "application/pdf" || 
           f.includes("text") ||
           f === "text/plain" ||
           f === "text/html";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileTypeCategory = (format: string) => {
    const f = format.toLowerCase();
    if (f.includes("image")) return "Image";
    if (f.includes("pdf")) return "PDF Document";
    if (f.includes("text")) return "Text Document";
    if (f.includes("video")) return "Video";
    if (f.includes("audio")) return "Audio";
    if (f.includes("zip") || f.includes("rar")) return "Archive";
    if (f.includes("word") || f.includes("doc")) return "Word Document";
    if (f.includes("excel") || f.includes("sheet")) return "Spreadsheet";
    if (f.includes("powerpoint") || f.includes("presentation")) return "Presentation";
    return "Document";
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            gap: 2,
          }}
        >
          <CircularProgress size={50} />
          <Typography variant="h6" color="text.secondary">
            Loading shared file...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: "100vh", pt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button 
              href="/" 
              variant="contained" 
              color="primary"
              size="large"
            >
              Go to Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!fileData) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: "100vh", pt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <ErrorIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              File Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The shared file you're looking for doesn't exist or has been removed.
            </Typography>
            <Button href="/" variant="contained">
              Go to Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  const isExpired = fileData.permissions.expires_at && 
                   new Date() > new Date(fileData.permissions.expires_at);
  
  const isAccessLimitReached = fileData.permissions.max_access_count && 
                              fileData.permissions.access_count >= fileData.permissions.max_access_count;

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
            <Typography variant="h5" component="h1">
              Shared File Access
            </Typography>
          </Box>
          
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>
                      {getFileIcon(fileData.file.format)}
                    </span>
                    {fileData.file.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Info />} 
                    label={getFileTypeCategory(fileData.file.format)} 
                    variant="outlined" 
                  />
                  <Chip 
                    label={formatFileSize(fileData.file.size)} 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={fileData.permissions.role === 'edit' ? <Edit /> : <Visibility />}
                    label={`${fileData.permissions.role} access`}
                    color={fileData.permissions.role === 'edit' ? 'primary' : 'default'}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Shared on: {new Date(fileData.file.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: "flex", flexDirection: 'column', gap: 1 }}>
                  {fileData.permissions.can_download && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                      onClick={handleDownload}
                      disabled={downloading || Boolean(isExpired) || Boolean(isAccessLimitReached)}
                      fullWidth
                    >
                      {downloading ? 'Downloading...' : 'Download File'}
                    </Button>
                  )}
                  
                  {!fileData.permissions.can_download && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Download is not allowed for this share
                    </Alert>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>

        {/* Permission Details */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Share Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Permission Level
                  </Typography>
                  <Chip 
                    icon={fileData.permissions.role === 'edit' ? <Edit /> : <Visibility />}
                    label={fileData.permissions.role.toUpperCase()}
                    color={fileData.permissions.role === 'edit' ? 'primary' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Download
                  </Typography>
                  <Chip 
                    icon={fileData.permissions.can_download ? <CheckCircle /> : <ErrorIcon />}
                    label={fileData.permissions.can_download ? 'Allowed' : 'Restricted'}
                    color={fileData.permissions.can_download ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Preview
                  </Typography>
                  <Chip 
                    icon={fileData.permissions.can_preview ? <CheckCircle /> : <ErrorIcon />}
                    label={fileData.permissions.can_preview ? 'Enabled' : 'Disabled'}
                    color={fileData.permissions.can_preview ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Access Count
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {fileData.permissions.access_count}
                    {fileData.permissions.max_access_count && 
                      ` / ${fileData.permissions.max_access_count}`
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {fileData.permissions.expires_at && (
              <Box sx={{ mt: 2, p: 2, bgcolor: isExpired ? 'error.light' : 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  {isExpired ? 'This share has expired on: ' : 'This share expires on: '}
                  {new Date(fileData.permissions.expires_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}

            {isAccessLimitReached && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Access limit reached. This share is no longer available.
              </Alert>
            )}
          </CardContent>
        </Paper>

        {/* File Preview */}
        {fileData.permissions.can_preview && canPreview(fileData.file.format) && fileData.file.publicUrl && !isExpired && !isAccessLimitReached && (
          <Paper elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                File Preview
              </Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                {fileData.file.format.toLowerCase().includes("image") && (
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: '#f9f9f9' }}>
                    <img
                      src={fileData.file.publicUrl}
                      alt={fileData.file.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "600px",
                        objectFit: "contain",
                        borderRadius: 4,
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextElement = target.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                    <Box sx={{ display: 'none', p: 4 }}>
                      <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        Image preview not available
                      </Typography>
                    </Box>
                  </Box>
                )}

                {fileData.file.format === "application/pdf" && (
                  <iframe
                    src={`${fileData.file.publicUrl}#toolbar=0`}
                    title="PDF Preview"
                    style={{ 
                      width: "100%", 
                      height: "600px", 
                      border: "none",
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLIFrameElement;
                      target.style.display = 'none';
                    }}
                  />
                )}

                {fileData.file.format.toLowerCase().includes("text") && (
                  <iframe
                    src={fileData.file.publicUrl}
                    title="Text Preview"
                    style={{ 
                      width: "100%", 
                      height: "400px", 
                      border: "none",
                      backgroundColor: 'white'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLIFrameElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Paper>
        )}

        {/* No Preview Available */}
        {(!fileData.permissions.can_preview || !canPreview(fileData.file.format)) && (
          <Paper elevation={1}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {!fileData.permissions.can_preview 
                  ? "Preview not allowed" 
                  : "Preview not available for this file type"
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fileData.permissions.can_download 
                  ? "Download the file to view its contents"
                  : "Contact the file owner for access"
                }
              </Typography>
            </CardContent>
          </Paper>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            This file was shared securely using Google Drive Clone
          </Typography>
          <Button 
            href="/" 
            variant="text" 
            size="small" 
            sx={{ mt: 1 }}
          >
            Create your own drive
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SharedFile;