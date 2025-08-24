// 1. Fix types/index.ts - Export all interfaces properly
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
  publicUrl: string;
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