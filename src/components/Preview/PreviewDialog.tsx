import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Close, Download, OpenInNew } from "@mui/icons-material";
import type { Item } from "../../types";
import { getFileTypeInfo, getPreviewType } from "../../utils/fileTypes";

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
  if (!item || item.type !== "file") return null;

  const fileInfo = getFileTypeInfo(item.format);
  const previewType = getPreviewType(item.format);

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
          <Box sx={{ textAlign: "center", p: 2 }}>
            <img
              src={item.publicUrl}
              alt={item.name}
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
        );

      case 'pdf':
        return (
          <iframe
            src={item.publicUrl}
            title="PDF Preview"
            style={{ width: "100%", height: "70vh", border: "none" }}
            onError={() => console.error("PDF load error")}
          />
        );

      case 'text':
        return (
          <iframe
            src={item.publicUrl}
            title="Text Preview"
            style={{ width: "100%", height: "70vh", border: "none" }}
            onError={() => console.error("Text file load error")}
          />
        );

      case 'video':
        return (
          <Box sx={{ p: 2 }}>
            <video
              controls
              style={{ width: "100%", maxHeight: "70vh" }}
              onError={() => console.error("Video load error")}
            >
              <source src={item.publicUrl} type={item.format} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case 'audio':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {fileInfo.icon} {item.name}
            </Typography>
            <audio
              controls
              style={{ width: "100%", maxWidth: "400px" }}
              onError={() => console.error("Audio load error")}
            >
              <source src={item.publicUrl} type={item.format} />
              Your browser does not support the audio tag.
            </audio>
          </Box>
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click download to open the file
              </Typography>
              <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => onDownload(item)}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  onClick={() => window.open(item.publicUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
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
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{ 
            flexGrow: 1, 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>{fileInfo.icon}</span>
          {item.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {previewType !== 'none' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={() => onDownload(item)}
            >
              Download
            </Button>
          )}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        {renderPreviewContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;