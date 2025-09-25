"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  deleteUploadedFile,
  extractSingleUploadUrl,
  uploadMultipleToFolder,
  uploadSingleToFolder,
  type UploadResponse,
} from "./uploadClient";

export type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

export interface UploadedAsset {
  id: string; // local identifier
  file?: File; // present for local files before upload
  name: string;
  size?: number;
  previewUrl?: string; // object URL for local preview
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
  public_id?: string;
  url?: string; // secure_url from server
}

export interface UseUploadOptions {
  path: string; // e.g. "categories/<id>/image" or any folder path
  multiple?: boolean;
  initial?: Array<{ public_id: string; url: string }>; // preloaded assets
  onChange?: (assets: Array<{ public_id: string; url: string }>) => void;
}

export function useUpload({
  path,
  multiple = false,
  initial = [],
  onChange,
}: UseUploadOptions) {
  const [assets, setAssets] = useState<UploadedAsset[]>(() =>
    initial.map((it, idx) => ({
      id: `init-${idx}`,
      name: it.public_id,
      status: "uploaded",
      progress: 100,
      public_id: it.public_id,
      url: it.url,
    }))
  );

  const revokeQueue = useRef<string[]>([]);

  const emitChange = useCallback(
    (next: UploadedAsset[]) => {
      if (onChange) {
        const out = next
          .filter((a) => a.status === "uploaded" && a.public_id && a.url)
          .map((a) => ({ public_id: a.public_id!, url: a.url! }));
        onChange(out);
      }
    },
    [onChange]
  );

  const addLocalFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const newItems: UploadedAsset[] = list.map((f, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        file: f,
        name: f.name,
        size: f.size,
        previewUrl: URL.createObjectURL(f),
        status: "idle",
        progress: 0,
      }));
      revokeQueue.current.push(
        ...newItems.map((n) => n.previewUrl!).filter(Boolean)
      );
      const next = multiple ? [...assets, ...newItems] : newItems.slice(0, 1);
      setAssets(next);
      emitChange(next);
      return next;
    },
    [assets, emitChange, multiple]
  );

  const uploadOne = useCallback(
    async (item: UploadedAsset): Promise<UploadedAsset> => {
      if (!item.file) return item;
      let updated: UploadedAsset = {
        ...item,
        status: "uploading",
        progress: 1,
      };
      setAssets((cur) => {
        const next = cur.map((a) => (a.id === item.id ? updated : a));
        return next;
      });
      try {
        const resp: UploadResponse = await uploadSingleToFolder(
          path,
          item.file,
          {
            onUploadProgress: (ev) => {
              if (!ev.total) return;
              const p = Math.round((ev.loaded / ev.total) * 100);
              setAssets((cur) => {
                const next = cur.map((a) =>
                  a.id === item.id ? { ...a, progress: p } : a
                );
                return next;
              });
            },
          }
        );
        const url = extractSingleUploadUrl(resp);
        const upload = (resp as any)?.data?.upload;
        updated = {
          ...updated,
          status: "uploaded",
          progress: 100,
          public_id: upload?.public_id,
          url: url,
        };
        setAssets((cur) => {
          const next = cur.map((a) => (a.id === item.id ? updated : a));
          if (onChange) {
            const out = next
              .filter((a) => a.status === "uploaded" && a.public_id && a.url)
              .map((a) => ({ public_id: a.public_id!, url: a.url! }));
            onChange(out);
          }
          return next;
        });
      } catch (e: any) {
        updated = {
          ...updated,
          status: "error",
          error: e?.response?.data?.message || e?.message || "Upload failed",
        };
        setAssets((cur) => {
          const next = cur.map((a) => (a.id === item.id ? updated : a));
          return next;
        });
      }
      return updated;
    },
    [path, onChange]
  );

  const uploadAll = useCallback(async () => {
    const pending = assets.filter((a) => a.status === "idle" && a.file);
    for (const item of pending) {
      // eslint-disable-next-line no-await-in-loop
      await uploadOne(item);
    }
  }, [assets, uploadOne]);

  const onFilesSelected = useCallback(
    async (files: FileList | File[]) => {
      const next = addLocalFiles(files);
      // Auto-start upload
      for (const item of next.filter((a) => a.status === "idle" && a.file)) {
        // eslint-disable-next-line no-await-in-loop
        await uploadOne(item);
      }
    },
    [addLocalFiles, uploadOne]
  );

  const removeLocal = useCallback(
    (id: string) => {
      const next = assets.filter((a) => a.id !== id);
      setAssets(next);
      emitChange(next);
    },
    [assets, emitChange]
  );

  const deleteRemote = useCallback(
    async (id: string) => {
      const item = assets.find((a) => a.id === id);
      if (!item) return;
      if (item.public_id) {
        try {
          await deleteUploadedFile(item.public_id);
        } catch (e) {
          // best-effort delete
        }
      }
      removeLocal(id);
    },
    [assets, removeLocal]
  );

  const clear = useCallback(() => {
    setAssets([]);
    emitChange([]);
  }, [emitChange]);

  // Cleanup previews
  const cleanup = useCallback(() => {
    revokeQueue.current.forEach((url) => URL.revokeObjectURL(url));
    revokeQueue.current = [];
  }, []);

  const api = useMemo(
    () => ({
      assets,
      onFilesSelected,
      uploadAll,
      uploadOne,
      removeLocal,
      deleteRemote,
      clear,
      cleanup,
    }),
    [
      assets,
      clear,
      cleanup,
      deleteRemote,
      onFilesSelected,
      removeLocal,
      uploadAll,
      uploadOne,
    ]
  );

  return api;
}
