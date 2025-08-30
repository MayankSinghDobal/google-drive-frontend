import axios from "axios";
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

const baseURL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
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

export const uploadFile = async (
  file: globalThis.File,
  folderId: number | null = null,
  config: { onUploadProgress?: (progressEvent: ProgressEvent) => void } = {}
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  if (folderId !== null) {
    formData.append("folder_id", folderId.toString());
  }
  
  const response = await api.post<UploadResponse>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
  return response.data;
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

// NEW: Delete file function
export const deleteFile = async (fileId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/files/${fileId}`);
  return response.data;
};

// NEW: Delete folder function
export const deleteFolder = async (folderId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/folders/${folderId}`);
  return response.data;
};

// NEW: Move file to folder
export const moveFile = async (
  fileId: number,
  targetFolderId: number | null
): Promise<{ file: CustomFile; message: string }> => {
  const response = await api.patch<{ file: CustomFile; message: string }>(`/files/${fileId}`, {
    folder_id: targetFolderId,
  });
  return response.data;
};

// NEW: Rename file
export const renameFile = async (
  fileId: number,
  newName: string
): Promise<{ file: CustomFile; message: string }> => {
  const response = await api.patch<{ file: CustomFile; message: string }>(`/files/${fileId}`, {
    name: newName,
  });
  return response.data;
};

// NEW: Rename folder
export const renameFolder = async (
  folderId: number,
  newName: string
): Promise<{ folder: Folder; message: string }> => {
  const response = await api.patch<{ folder: Folder; message: string }>(`/folders/${folderId}`, {
    name: newName,
  });
  return response.data;
};

// NEW: Move folder
export const moveFolder = async (
  folderId: number,
  targetParentId: number | null
): Promise<{ folder: Folder; message: string }> => {
  const response = await api.patch<{ folder: Folder; message: string }>(`/folders/${folderId}`, {
    parent_id: targetParentId,
  });
  return response.data;
};

// NEW: Get signed URL for secure download
export const getSecureDownloadUrl = async (
  fileId: number
): Promise<{ signedUrl: string; fileName: string }> => {
  const response = await api.get<{ signedUrl: string; fileName: string }>(`/files/${fileId}/download`);
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