// utils/fileTypes.ts
export interface FileTypeInfo {
  icon: string;
  color: string;
  canPreview: boolean;
  previewType: 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'office' | 'none';
  category: string;
  openWithOptions: string[];
}

export const FILE_TYPES: Record<string, FileTypeInfo> = {
  // Images
  'image/jpeg': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'Photoshop', 'GIMP', 'Paint']
  },
  'image/jpg': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'Photoshop', 'GIMP', 'Paint']
  },
  'image/png': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'Photoshop', 'GIMP', 'Paint']
  },
  'image/gif': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'GIF Viewer']
  },
  'image/webp': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'Photoshop']
  },
  'image/svg+xml': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'VSCode', 'Inkscape', 'Illustrator']
  },
  'image/bmp': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Browser', 'Image Viewer', 'Paint', 'Photoshop']
  },
  'image/tiff': { 
    icon: '🖼️', color: '#4CAF50', canPreview: true, previewType: 'image', category: 'Image',
    openWithOptions: ['Image Viewer', 'Photoshop', 'GIMP']
  },

  // Documents - PDFs
  'application/pdf': { 
    icon: '📄', color: '#F44336', canPreview: true, previewType: 'pdf', category: 'Document',
    openWithOptions: ['Browser', 'Adobe Reader', 'PDF Viewer', 'Chrome', 'Edge']
  },

  // Microsoft Office Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    icon: '📘', color: '#2196F3', canPreview: false, previewType: 'office', category: 'Document',
    openWithOptions: ['Microsoft Word', 'LibreOffice Writer', 'Google Docs', 'WordPad']
  },
  'application/msword': { 
    icon: '📘', color: '#2196F3', canPreview: false, previewType: 'office', category: 'Document',
    openWithOptions: ['Microsoft Word', 'LibreOffice Writer', 'WordPad']
  },
  'application/vnd.ms-excel': { 
    icon: '📊', color: '#4CAF50', canPreview: false, previewType: 'office', category: 'Spreadsheet',
    openWithOptions: ['Microsoft Excel', 'LibreOffice Calc', 'Google Sheets']
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    icon: '📊', color: '#4CAF50', canPreview: false, previewType: 'office', category: 'Spreadsheet',
    openWithOptions: ['Microsoft Excel', 'LibreOffice Calc', 'Google Sheets']
  },
  'application/vnd.ms-powerpoint': { 
    icon: '🎞️', color: '#FF5722', canPreview: false, previewType: 'office', category: 'Presentation',
    openWithOptions: ['Microsoft PowerPoint', 'LibreOffice Impress', 'Google Slides']
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { 
    icon: '🎞️', color: '#FF5722', canPreview: false, previewType: 'office', category: 'Presentation',
    openWithOptions: ['Microsoft PowerPoint', 'LibreOffice Impress', 'Google Slides']
  },

  // Text Files
  'text/plain': { 
    icon: '📝', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Text',
    openWithOptions: ['Notepad', 'VSCode', 'Sublime Text', 'Vim', 'Nano', 'TextEdit']
  },
  'text/html': { 
    icon: '🌐', color: '#FF9800', canPreview: true, previewType: 'text', category: 'Web',
    openWithOptions: ['Browser', 'VSCode', 'Sublime Text', 'Notepad++', 'WebStorm']
  },
  'text/css': { 
    icon: '🎨', color: '#673AB7', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'Sublime Text', 'Notepad++', 'WebStorm', 'Atom']
  },
  'text/javascript': { 
    icon: '⚡', color: '#FFC107', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'WebStorm', 'Sublime Text', 'Notepad++', 'Node.js']
  },
  'application/javascript': { 
    icon: '⚡', color: '#FFC107', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'WebStorm', 'Sublime Text', 'Notepad++', 'Node.js']
  },
  'text/typescript': { 
    icon: '🔷', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'WebStorm', 'Sublime Text', 'Notepad++']
  },
  'application/typescript': { 
    icon: '🔷', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'WebStorm', 'Sublime Text', 'Notepad++']
  },
  'application/json': { 
    icon: '📋', color: '#009688', canPreview: true, previewType: 'text', category: 'Data',
    openWithOptions: ['VSCode', 'Sublime Text', 'Notepad++', 'JSON Viewer', 'Browser']
  },
  'text/xml': { 
    icon: '📋', color: '#795548', canPreview: true, previewType: 'text', category: 'Data',
    openWithOptions: ['VSCode', 'Sublime Text', 'Notepad++', 'XML Editor', 'Browser']
  },
  'text/csv': { 
    icon: '📊', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Data',
    openWithOptions: ['Excel', 'LibreOffice Calc', 'Google Sheets', 'VSCode', 'Notepad++']
  },
  'text/markdown': { 
    icon: '📝', color: '#2196F3', canPreview: true, previewType: 'text', category: 'Text',
    openWithOptions: ['VSCode', 'Typora', 'Mark Text', 'Sublime Text', 'Notepad++']
  },

  // Code Files
  'text/x-python': { 
    icon: '🐍', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'PyCharm', 'Sublime Text', 'Vim', 'IDLE', 'Python']
  },
  'application/x-python-code': { 
    icon: '🐍', color: '#4CAF50', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'PyCharm', 'Sublime Text', 'Vim', 'IDLE', 'Python']
  },
  'text/x-java': { 
    icon: '☕', color: '#FF5722', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['IntelliJ IDEA', 'Eclipse', 'VSCode', 'NetBeans', 'Sublime Text']
  },
  'text/x-csharp': { 
    icon: '🔷', color: '#9C27B0', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['Visual Studio', 'VSCode', 'Rider', 'MonoDevelop']
  },
  'text/x-php': { 
    icon: '🐘', color: '#673AB7', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'PHPStorm', 'Sublime Text', 'Notepad++', 'PHP']
  },
  'text/x-ruby': { 
    icon: '💎', color: '#E91E63', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'RubyMine', 'Sublime Text', 'Vim', 'Ruby']
  },
  'text/x-go': { 
    icon: '🔵', color: '#00BCD4', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'GoLand', 'Sublime Text', 'Vim', 'Go']
  },
  'text/x-rust': { 
    icon: '⚙️', color: '#FF5722', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['VSCode', 'IntelliJ Rust', 'Sublime Text', 'Vim', 'Rust Analyzer']
  },
  'text/x-kotlin': { 
    icon: '🟣', color: '#9C27B0', canPreview: true, previewType: 'text', category: 'Code',
    openWithOptions: ['IntelliJ IDEA', 'Android Studio', 'VSCode', 'Sublime Text']
  },

  // Videos
  'video/mp4': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['Browser', 'VLC', 'Windows Media Player', 'QuickTime', 'Media Player Classic']
  },
  'video/webm': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['Browser', 'VLC', 'Media Player Classic', 'Chrome', 'Firefox']
  },
  'video/ogg': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['Browser', 'VLC', 'Media Player Classic', 'Firefox']
  },
  'video/avi': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['VLC', 'Windows Media Player', 'Media Player Classic', 'KMPlayer']
  },
  'video/mov': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['QuickTime', 'VLC', 'Windows Media Player', 'Media Player Classic']
  },
  'video/wmv': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['Windows Media Player', 'VLC', 'Media Player Classic']
  },
  'video/flv': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['VLC', 'Flash Player', 'Media Player Classic', 'KMPlayer']
  },
  'video/mkv': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['VLC', 'Media Player Classic', 'KMPlayer', 'PotPlayer']
  },
  'video/m4v': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['iTunes', 'QuickTime', 'VLC', 'Media Player Classic']
  },
  'video/3gp': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['VLC', 'Media Player Classic', 'QuickTime', 'Real Player']
  },
  'video/quicktime': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['QuickTime', 'VLC', 'Media Player Classic']
  },
  'video/x-msvideo': { 
    icon: '🎥', color: '#E91E63', canPreview: true, previewType: 'video', category: 'Video',
    openWithOptions: ['VLC', 'Windows Media Player', 'Media Player Classic']
  },

  // Audio
  'audio/mpeg': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['Browser', 'Windows Media Player', 'VLC', 'iTunes', 'Spotify']
  },
  'audio/mp3': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['Browser', 'Windows Media Player', 'VLC', 'iTunes', 'Winamp']
  },
  'audio/wav': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['Windows Media Player', 'VLC', 'Audacity', 'iTunes']
  },
  'audio/ogg': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['Browser', 'VLC', 'Audacity', 'Firefox', 'Chrome']
  },
  'audio/aac': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['iTunes', 'VLC', 'Windows Media Player', 'QuickTime']
  },
  'audio/flac': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['VLC', 'foobar2000', 'Audacity', 'Media Player Classic']
  },
  'audio/wma': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['Windows Media Player', 'VLC', 'Winamp']
  },
  'audio/m4a': { 
    icon: '🎵', color: '#9C27B0', canPreview: true, previewType: 'audio', category: 'Audio',
    openWithOptions: ['iTunes', 'QuickTime', 'VLC', 'Windows Media Player']
  },

  // Archives
  'application/zip': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['WinRAR', '7-Zip', 'Windows Explorer', 'WinZip', 'PeaZip']
  },
  'application/x-zip-compressed': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['WinRAR', '7-Zip', 'Windows Explorer', 'WinZip', 'PeaZip']
  },
  'application/x-rar-compressed': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['WinRAR', '7-Zip', 'PeaZip', 'WinZip']
  },
  'application/x-rar': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['WinRAR', '7-Zip', 'PeaZip', 'WinZip']
  },
  'application/x-7z-compressed': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['7-Zip', 'WinRAR', 'PeaZip', 'WinZip']
  },
  'application/gzip': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['7-Zip', 'WinRAR', 'gzip', 'tar', 'PeaZip']
  },
  'application/x-tar': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['7-Zip', 'WinRAR', 'tar', 'PeaZip']
  },
  'application/x-bzip2': { 
    icon: '📦', color: '#607D8B', canPreview: false, previewType: 'none', category: 'Archive',
    openWithOptions: ['7-Zip', 'WinRAR', 'bzip2', 'PeaZip']
  },

  // Others
  'application/octet-stream': { 
    icon: '📄', color: '#757575', canPreview: false, previewType: 'none', category: 'Binary',
    openWithOptions: ['Hex Editor', 'Binary Editor', 'Notepad++', 'VSCode']
  },
  'application/x-executable': { 
    icon: '⚙️', color: '#424242', canPreview: false, previewType: 'none', category: 'Executable',
    openWithOptions: ['System Default', 'Command Prompt', 'PowerShell']
  },
  'application/vnd.android.package-archive': { 
    icon: '🤖', color: '#4CAF50', canPreview: false, previewType: 'none', category: 'Mobile App',
    openWithOptions: ['Android Device', 'APK Installer', 'BlueStacks', 'Android Emulator']
  },
  'application/x-deb': { 
    icon: '📦', color: '#E91E63', canPreview: false, previewType: 'none', category: 'Package',
    openWithOptions: ['dpkg', 'Ubuntu Software', 'GDebi', 'Synaptic']
  },
  'application/x-rpm': { 
    icon: '📦', color: '#F44336', canPreview: false, previewType: 'none', category: 'Package',
    openWithOptions: ['rpm', 'YUM', 'DNF', 'Package Manager']
  }
};

export const getFileTypeInfo = (mimeType: string): FileTypeInfo => {
  return FILE_TYPES[mimeType] || { 
    icon: '📄', 
    color: '#757575', 
    canPreview: false, 
    previewType: 'none', 
    category: 'Unknown',
    openWithOptions: ['System Default', 'Choose Application']
  };
};

export const canPreviewFile = (mimeType: string): boolean => {
  return getFileTypeInfo(mimeType).canPreview;
};

export const getPreviewType = (mimeType: string): 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'office' | 'none' => {
  return getFileTypeInfo(mimeType).previewType;
};

export const getOpenWithOptions = (mimeType: string): string[] => {
  return getFileTypeInfo(mimeType).openWithOptions;
};