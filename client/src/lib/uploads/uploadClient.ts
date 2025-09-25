import axiosSeller from "@/lib/api/axiosSeller";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export type UploadResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export interface UploadedFileInfo {
  public_id: string;
  secure_url: string;
  url?: string;
  [key: string]: any;
}

export interface UploadOptions {
  axiosInstance?: AxiosInstance;
  userType?: "user" | "seller" | "admin";
  // optional extra metadata to send alongside upload
  metadata?: Record<string, any>;
  onUploadProgress?: AxiosRequestConfig["onUploadProgress"];
}

export async function uploadSingleToFolder(
  categoryPath: string,
  file: File,
  opts: UploadOptions = {}
): Promise<UploadResponse> {
  const instance = opts.axiosInstance || axiosSeller;
  const form = new FormData();
  form.append("file", file);
  if (opts.metadata) form.append("metadata", JSON.stringify(opts.metadata));

  const url = `/uploads/folders/${encodeCategoryPath(categoryPath)}`;
  const res = await instance.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: opts.onUploadProgress,
  });
  return res.data as UploadResponse;
}

export async function uploadMultipleToFolder(
  categoryPath: string,
  files: File[],
  opts: UploadOptions = {}
): Promise<UploadResponse> {
  const instance = opts.axiosInstance || axiosSeller;
  const form = new FormData();
  for (const f of files) form.append("files", f);
  if (opts.metadata) form.append("metadata", JSON.stringify(opts.metadata));

  const url = `/uploads/folders/${encodeCategoryPath(categoryPath)}/multiple`;
  const res = await instance.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: opts.onUploadProgress,
  });
  return res.data as UploadResponse;
}

export async function deleteUploadedFile(
  publicId: string,
  opts: UploadOptions = {}
): Promise<UploadResponse> {
  const instance = opts.axiosInstance || axiosSeller;
  const url = `/uploads/files/${encodeURIComponent(publicId)}`;
  const res = await instance.delete(url);
  return res.data as UploadResponse;
}

export function extractSingleUploadUrl(
  resp: UploadResponse
): string | undefined {
  // Expected server response shape: { success, data: { upload: { secure_url, url? }}}
  const anyData: any = resp?.data;
  return anyData?.upload?.secure_url || anyData?.upload?.url;
}

function encodeCategoryPath(path: string) {
  // Encode each segment but preserve slashes in the route
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}
