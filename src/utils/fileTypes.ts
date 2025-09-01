// utils/fileTypes.ts
export interface FileTypeInfo {
  icon: string;
  color: string;
  canPreview: boolean;
  previewType: 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'none';
  category: string;
}

export const FILE_TYPES: Record<string, FileTypeInfo> = {
  // Images
  'image/jpeg': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },
  'image/jpg': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },
  'image/png': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },
  'image/gif': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },
  'image/webp': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },
  'image/svg+xml': { icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image' },

  // Documents
  'application/pdf': { icon: '📄', color: '#F44336', canPreview: true, previewType: 'pdf', category: 'Document' },
  'text/plain': { icon: '📝', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Text' },
  'text/html': { icon: '🌐', color: '#FF9800', canPreview: true, previewType: 'text', category: 'Web' },
  'text/css': { icon: '🎨', color: '#673AB7', canPreview: true, previewType: 'text', category: 'Code' },
  'text/javascript': { icon: '⚡', color: '#FFC107', canPreview: true, previewType: 'text', category: 'Code' },
  'application/json': { icon: '📋', color: '#009688', canPreview: true, previewType: 'text', category: 'Data' },
  'text/xml': { icon: '📋', color: '#795548', canPreview: true, previewType: 'text', category: 'Data' },
  'text/csv': { icon: '📊', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Data' },

  // Microsoft Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    icon: '📘', color: '#2196F3', canPreview: false, previewType: 'none', category: 'Document' 
  },
  'application/msword': { icon: '📘', color: '#2196F3', canPreview: false, previewType: 'none', category: 'Document' },
  

  // Videos
  'video/mp4': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
  'video/webm': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
  'video/ogg': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
  'video/avi': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
  'video/mov': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
  'video/wmv': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },

  // Audio
  'audio/mpeg': { icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio' },
  'audio/mp3': { icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio' },
  'audio/wav': { icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio' },
  'audio/ogg': { icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio' },
  'audio/aac': { icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio' },

  // Archives
  'application/zip': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },
  'application/x-rar-compressed': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },
  'application/x-7z-compressed': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },
  'application/gzip': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },
  'application/x-tar': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },

  // Code files
  'application/javascript': { icon: '⚡', color: '#FFC107', canPreview: true, previewType: 'text', category: 'Code' },
  'text/typescript': { icon: '🔷', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Code' },
  'text/x-python': { icon: '🐍', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Code' },
  'text/x-java': { icon: '☕', color: '#FF5722', canPreview: true, previewType: 'text', category: 'Code' },
  'text/x-csharp': { icon: '🔷', color: '#9C27B0', canPreview: true, previewType: 'text', category: 'Code' },
  'text/x-php': { icon: '🐘', color: '#673AB7', canPreview: true, previewType: 'text', category: 'Code' },
  'text/x-ruby': { icon: '💎', color: '#E91E63', canPreview: true, previewType: 'text', category: 'Code' },

  // Others
  'application/octet-stream': { icon: '📄', color: '#757575', canPreview: false, previewType: 'none', category: 'Binary' },
  // Add these to your existing FILE_TYPES object:

// Excel files
'application/vnd.ms-excel': { icon: '📊', color: '#4CAF50', canPreview: false, previewType: 'none', category: 'Spreadsheet' },
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📊', color: '#4CAF50', canPreview: false, previewType: 'none', category: 'Spreadsheet' },

// PowerPoint files
'application/vnd.ms-powerpoint': { icon: '📽️', color: '#FF5722', canPreview: false, previewType: 'none', category: 'Presentation' },
'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📽️', color: '#FF5722', canPreview: false, previewType: 'none', category: 'Presentation' },

// More video formats
'video/quicktime': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },
'video/x-msvideo': { icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video' },

// Archives
'application/x-rar': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },
'application/x-zip-compressed': { icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive' },

// More code files
'text/markdown': { icon: '📝', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Text' },
'application/x-python-code': { icon: '🐍', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Code' },
};

export const getFileTypeInfo = (mimeType: string): FileTypeInfo => {
  return FILE_TYPES[mimeType] || { 
    icon: '📄', 
    color: '#757575', 
    canPreview: false, 
    previewType: 'none', 
    category: 'Unknown' 
  };
};

export const canPreviewFile = (mimeType: string): boolean => {
  return getFileTypeInfo(mimeType).canPreview;
};

export const getPreviewType = (mimeType: string): 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'none' => {
  return getFileTypeInfo(mimeType).previewType;
};