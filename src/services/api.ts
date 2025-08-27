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
  const response = await api.get<FilesResponse>("/files", {
    params: folderId ? { folder_id: folderId } : {},
  });
  
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
  if (folderId) {
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
  email: string,
  role: "view" | "edit" = "view"
): Promise<ShareResponse> => {
  const response = await api.post<ShareResponse>(`/files/${fileId}/share`, {
    email,
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