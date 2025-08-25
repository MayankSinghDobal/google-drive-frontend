import axios from "axios";
import type { File as CustomFile, Folder, User } from "../types";

interface AuthMeResponse {
  user: User;
}

interface FilesResponse {
  files: (CustomFile | Folder)[];
}

interface SearchResponse {
  results: (CustomFile | Folder)[];
}

interface UploadResponse {
  file: CustomFile;
  message: string;
}

interface ShareResponse {
  message: string;
}

// Use environment variable or default to localhost
const baseURL = import.meta.env.VITE_API_URL || "https://google-drive-backend-ten.vercel.app";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  folderId: number | null
): Promise<(CustomFile | Folder)[]> => {
  const response = await api.get<FilesResponse>("/files", {
    params: { folder_id: folderId },
  });
  return response.data.files;
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
  folderId: number | null,
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
  role: "view" | "edit"
): Promise<ShareResponse> => {
  const response = await api.post<ShareResponse>(`/files/${fileId}/share`, {
    role,
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Even if logout fails on server, clear local token
    console.warn("Logout request failed:", error);
  } finally {
    localStorage.removeItem("token");
  }
};

export default api;