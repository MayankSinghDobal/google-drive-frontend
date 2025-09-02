import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import type { File as CustomFile, Folder, User } from "../types";

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
    onUploadProgress?: (progressEvent: AxiosProgressEvent | ProgressEvent) => void;
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
        const loaded = (progressEvent as any).loaded ?? (progressEvent as any).bytes ?? 0;
        const total = (progressEvent as any).total ?? 1;
        const percentCompleted = Math.round((loaded * 100) / total);
        console.log(`Upload progress: ${percentCompleted}%`);
        if (config.onUploadProgress) {
          config.onUploadProgress(progressEvent as any);
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

export const shareFile = async (
  fileId: number,
  role: "view" | "edit" = "view"
): Promise<ShareResponse> => {
  const response = await api.post<ShareResponse>(`/files/${fileId}/share`, {
    role,
  });
  return response.data;
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

// Enhanced download function with automatic file download
export const downloadFile = async (
  fileId: number,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(10);
    const downloadData = await getSecureDownloadUrl(fileId);
    onProgress?.(30);
    
    // Create a hidden anchor element to trigger download
    const link = document.createElement("a");
    link.href = downloadData.signedUrl;
    link.download = downloadData.fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    
    // Add to DOM temporarily
    document.body.appendChild(link);
    onProgress?.(60);
    
    // Trigger download
    link.click();
    onProgress?.(90);
    
    // Clean up
    document.body.removeChild(link);
    onProgress?.(100);
    
    console.log(`Download initiated for: ${downloadData.fileName}`);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Alternative download method using fetch for better control

export const downloadFileWithFetch = async (
  fileId: number,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(5);
    const downloadData = await getSecureDownloadUrl(fileId);
    onProgress?.(10);

    const response = await fetch(downloadData.signedUrl, {
      method: 'GET',
      headers: { Accept: '*/*' },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    // Try to get content length for progress calculation
    const contentLengthHeader = response.headers.get('Content-Length') || response.headers.get('content-length');
    const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;

    if (!response.body) {
      // Fallback: use blob directly
      const blobFallback = await response.blob();
      const url = window.URL.createObjectURL(blobFallback);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onProgress?.(100);
      return;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        if (total) {
          const pct = Math.round((received / total) * 100);
          onProgress?.(pct);
        } else {
          // Estimate progress with arbitrary scaling if total unknown
          onProgress?.(Math.min(95, Math.round((received / (1024 * 1024)) * 10)));
        }
      }
    }

    // Combine chunks into a single Uint8Array
    const combined = new Uint8Array(received);
    let position = 0;
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.length;
    }

    // Create blob from Uint8Array
    const blob = new Blob([combined]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadData.fileName;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    onProgress?.(100);
    console.log(`Download completed: ${downloadData.fileName}`);
  } catch (error) {
    console.error('Fetch download failed:', error);
    throw error;
  }
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