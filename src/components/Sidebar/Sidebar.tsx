// 2. Fixed Sidebar.tsx - Remove deprecated 'button' prop
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { Folder, ExpandLess, ExpandMore } from "@mui/icons-material";
import { motion } from "framer-motion";
import type { Folder as FolderType } from "../../types";

interface SidebarProps {
  folders: FolderType[];
  selectedFolder: number | null;
  onFolderSelect: (folderId: number | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
}) => {
  const [openFolders, setOpenFolders] = React.useState<number[]>([]);

  const handleToggleFolder = (folderId: number) => {
    setOpenFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolder = (folder: FolderType, depth: number = 0) => {
    const childFolders = folders.filter((f) => f.parent_id === folder.id);
    const isOpen = openFolders.includes(folder.id);

    return (
      <React.Fragment key={folder.id}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleToggleFolder(folder.id);
                onFolderSelect(folder.id);
              }}
              selected={selectedFolder === folder.id}
              sx={{ pl: 2 + depth * 2 }}
            >
              <ListItemIcon>
                <Folder
                  color={selectedFolder === folder.id ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText primary={folder.name} />
              {childFolders.length > 0 &&
                (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>
        </motion.div>
        {childFolders.length > 0 && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {childFolders.map((child) => renderFolder(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onFolderSelect(null)}>
            <ListItemText primary="My Drive" />
          </ListItemButton>
        </ListItem>
        {folders
          .filter((folder) => folder.parent_id === null)
          .map((folder) => renderFolder(folder))}
      </List>
    </Drawer>
  );
};

export default Sidebar;