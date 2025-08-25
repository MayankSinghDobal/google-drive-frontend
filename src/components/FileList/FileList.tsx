import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
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
    if (item.type === "file" && item.publicUrl) {
      if (["image/jpeg", "image/png"].includes(item.format)) {
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

  return (
    <>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {items.map((item) => (
          <Grid
            key={item.id}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card>
                <CardContent
                  sx={{
                    cursor:
                      item.type === "file" &&
                      [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "text/plain",
                      ].includes(item.format)
                        ? "pointer"
                        : "default",
                  }}
                  onClick={() => handlePreview(item)}
                >
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.type === "file"
                      ? `${(item.size / 1024).toFixed(2)} KB | ${item.format}`
                      : "Folder"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                {item.type === "file" && (
                  <CardActions>
                    <Button size="small" onClick={() => onShare(item.id)}>
                      Share
                    </Button>
                  </CardActions>
                )}
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {previewType === "image" && previewUrl && (
            <img src={previewUrl} alt="Preview" style={{ width: "100%" }} />
          )}
          {previewType === "pdf" && previewUrl && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "500px" }}
            />
          )}
          {previewType === "text" && previewUrl && (
            <iframe
              src={previewUrl}
              title="Text Preview"
              style={{ width: "100%", height: "500px" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileList;