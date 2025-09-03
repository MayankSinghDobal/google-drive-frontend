import axios from "axios";
import type { File as CustomFile, Folder, User } from "../types";
import type { AxiosProgressEvent } from "axios";

interface AuthMeResponse {
  user: User;
}

interface FilesResponse {
  files: (CustomFile | Folder)[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface SearchResponse {
  results: (CustomFile | Folder)[];
}

interface UploadResponse {
  file: CustomFile;
  message: string;
  publicUrl: string;
}

interface ShareResponse {
  message: string;
  permission: any;
  shareableLink: string;
}

interface DownloadResponse {
  signedUrl: string;
  fileName: string;
  fileSize: number;
  fileFormat: string;
  expiresIn: number;
}

interface ClipboardResponse {
  message: string;
  operation?: string;
  itemType?: string;
  itemName?: string;
}

interface PasteResponse {
  message: string;
  item: CustomFile | Folder;
  operation: string;
}

const baseURL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 60000, // Increased timeout for large files
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    headers: config.headers?.Authorization ? 'Bearer ***' : 'None',
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const getUser = async (): Promise<User> => {
  const response = await api.get<AuthMeResponse>("/auth/me");
  return response.data.user;
};

export const getFilesAndFolders = async (
  folderId: number | null = null
): Promise<(CustomFile | Folder)[]> => {
  const response = await api.get<FilesResponse>("/files/with-folders");
  
  // Handle both files and folders, add type property
  const items = (response.data.files || []).map(item => {
    if ('size' in item) {
      return { ...item, type: 'file' as const };
    } else {
      return { ...item, type: 'folder' as const };
    }
  });
  
  return items;
};

export const searchItems = async (
  query: string
): Promise<(CustomFile | Folder)[]> => {
  const response = await api.get<SearchResponse>("/search", {
    params: { query },
  });
  return response.data.results;
};

// Enhanced upload function with better progress tracking
export const uploadFile = async (
  file: globalThis.File,
  folderId: number | null = null,
  config: { 
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    onSuccess?: (response: UploadResponse) => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    if (folderId !== null) {
      formData.append("folder_id", folderId.toString());
    }
    
    console.log(`Uploading file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    
    const postConfig = {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for large files
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
        if (config.onUploadProgress) {
          config.onUploadProgress(progressEvent);
        }
      },
    };
    
    const response = await api.post("/files/upload", formData, postConfig);
    
    const uploadResponse = response.data as UploadResponse;
    
    console.log('Upload successful:', uploadResponse);
    if (config.onSuccess) {
      config.onSuccess(uploadResponse);
    }
    
    return uploadResponse;
  } catch (error) {
    console.error('Upload failed:', error);
    if (config.onError && error instanceof Error) {
      config.onError(error);
    }
    throw error;
  }
};

// Enhanced share function with permissions
export const shareFile = async (
  fileId: number,
  options: {
    role: "view" | "edit";
    can_download?: boolean;
    can_preview?: boolean;
    expires_at?: string | null;
    max_access_count?: number | null;
  } = { role: "view" }
): Promise<ShareResponse> => {
  const response = await api.post<ShareResponse>(`/files/${fileId}/share`, options);
  return response.data;
};

/**
 * Get shared file metadata by token
 * Backend expected route: GET /share/:token
 */
export const getSharedFileByToken = async (token: string): Promise<any> => {
  const response = await api.get(`/share/${token}`);
  return response.data;
};

/**
 * Download a shared file by token (creates blob and triggers browser download)
 */
export const downloadSharedFileByToken = async (
  token: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(10);

    const response = await api.get(`/share/${token}/download`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      },
    });

    const contentType = (response.headers && response.headers['content-type']) || 'application/octet-stream';
    const contentDisposition = response.headers && response.headers['content-disposition'];
    let filename = `shared_file_${token}`;

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);
      if (matches && matches[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
      } else {
        const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m && m[1]) {
          filename = m[1].replace(/['"]/g, '');
        }
      }
    }

    if (!filename.includes('.') && contentType && contentType.includes('/')) {
      const subtype = contentType.split('/')[1];
      if (subtype) {
        filename = `${filename}.${subtype.split('+')[0]}`;
      }
    }

    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onProgress?.(100);
    console.log(`Shared download completed: ${filename}`);
  } catch (error) {
    console.error('Shared download failed:', error);
    throw error;
  }
};


export const createFolder = async (
  name: string,
  parentId: number | null = null
): Promise<{ folder: Folder; message: string }> => {
  const response = await api.post<{ folder: Folder; message: string }>("/folders/create", {
    name,
    parent_id: parentId,
  });
  return response.data;
};

// Enhanced secure download function
export const getSecureDownloadUrl = async (
  fileId: number
): Promise<DownloadResponse> => {
  try {
    console.log(`Getting download URL for file: ${fileId}`);
    const response = await api.get<DownloadResponse>(`/files/${fileId}/download`);
    console.log('Download URL generated:', response.data.fileName);
    return response.data;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error;
  }
};

// Enhanced download function with direct file streaming
export const downloadFile = async (
  fileId: number,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(10);

    // Direct download from backend
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      }
    });

    // Determine content type and filename
    const contentType = (response.headers && response.headers['content-type']) || 'application/octet-stream';
    const contentDisposition = response.headers && response.headers['content-disposition'];
    let filename = `file_${fileId}`;

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);
      if (matches && matches[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
      } else {
        // fallback regex
        const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m && m[1]) {
          filename = m[1].replace(/['"]/g, '');
        }
      }
    }

    // append extension from content-type if missing
    if (!filename.includes('.') && contentType && contentType.includes('/')) {
      const subtype = contentType.split('/')[1];
      if (subtype) {
        filename = `${filename}.${subtype.split('+')[0]}`;
      }
    }

    // Create blob using contentType, so browser uses correct MIME
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onProgress?.(100);
    console.log(`Download completed: ${filename}`);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};
// kept a thin compatibility wrapper for alternate download methods
export const downloadFileWithFetch = async (
  fileId: number,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return downloadFile(fileId, onProgress);
};

// Delete functions
export const deleteFile = async (fileId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/files/${fileId}`);
  return response.data;
};

export const deleteFolder = async (folderId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/folders/${folderId}`);
  return response.data;
};

// Move functions
export const moveFile = async (
  fileId: number,
  targetFolderId: number | null
): Promise<{ file: CustomFile; message: string }> => {
  const response = await api.patch<{ file: CustomFile; message: string }>(`/files/${fileId}`, {
    folder_id: targetFolderId,
  });
  return response.data;
};

export const moveFolder = async (
  folderId: number,
  targetParentId: number | null
): Promise<{ folder: Folder; message: string }> => {
  const response = await api.patch<{ folder: Folder; message: string }>(`/folders/${folderId}`, {
    parent_id: targetParentId,
  });
  return response.data;
};

// Rename functions
export const renameFile = async (
  fileId: number,
  newName: string
): Promise<{ file: CustomFile; message: string }> => {
  const response = await api.patch<{ file: CustomFile; message: string }>(`/files/${fileId}`, {
    name: newName,
  });
  return response.data;
};

export const renameFolder = async (
  folderId: number,
  newName: string
): Promise<{ folder: Folder; message: string }> => {
  const response = await api.patch<{ folder: Folder; message: string }>(`/folders/${folderId}`, {
    name: newName,
  });
  return response.data;
};

// Clipboard operations
export const copyToClipboard = async (
  itemId: number,
  itemType: 'file' | 'folder'
): Promise<ClipboardResponse> => {
  const response = await api.post<ClipboardResponse>(`/clipboard/copy/${itemType}/${itemId}`);
  return response.data;
};

export const cutToClipboard = async (
  itemId: number,
  itemType: 'file' | 'folder'
): Promise<ClipboardResponse> => {
  const response = await api.post<ClipboardResponse>(`/clipboard/cut/${itemType}/${itemId}`);
  return response.data;
};

export const pasteFromClipboard = async (
  targetFolderId?: number | null
): Promise<PasteResponse> => {
  const url = targetFolderId ? `/clipboard/paste/${targetFolderId}` : '/clipboard/paste';
  const response = await api.post<PasteResponse>(url);
  return response.data;
};

export const getClipboardContents = async (): Promise<any[]> => {
  const response = await api.get('/clipboard/contents');
  return response.data.clipboard || [];
};

export const clearClipboard = async (): Promise<{ message: string }> => {
  const response = await api.delete('/clipboard/clear');
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.warn("Logout request failed:", error);
  } finally {
    localStorage.removeItem("token");
  }
};

export default api;