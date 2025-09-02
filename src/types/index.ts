export interface File {
  id: number;
  name: string;
  size: number;
  format: string;
  path: string;
  user_id: number;
  folder_id: number | null;
  created_at: string;
  type: "file";
  publicUrl?: string;
}

export interface Folder {
  id: number;
  name: string;
  user_id: number;
  parent_id: number | null;
  created_at: string;
  type: "folder";
}

export type Item = File | Folder;

export interface User {
  id: number;
  email: string;
  name: string;
}

// Additional types for better type safety
export interface SharePermission {
  role: "view" | "edit";
  can_download: boolean;
  can_preview: boolean;
  expires_at: string | null;
  access_count: number;
  max_access_count: number | null;
}

export interface SharedFileData {
  file: File;
  permissions: SharePermission;
}

export interface UploadConfig {
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
  message?: string;
}