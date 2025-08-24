// Fixed FileList.tsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import type { Item } from "../../types";

interface FileListProps {
  items: Item[];
  onShare: (id: number) => void;
}

const FileList: React.FC<FileListProps> = ({ items, onShare }) => {
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card>
              <CardContent>
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
  );
};

export default FileList;