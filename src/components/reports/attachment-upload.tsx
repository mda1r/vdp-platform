"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export function AttachmentUpload({
  reportId,
  attachments,
  canDelete,
}: {
  reportId: string;
  attachments: Attachment[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/reports/${reportId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Upload failed");
      } else {
        toast.success("File uploaded");
        router.refresh();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(attachmentId: string) {
    setDeletingId(attachmentId);
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Delete failed");
      } else {
        toast.success("Attachment removed");
        router.refresh();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
            <a
              href={`/api/attachments/${att.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium hover:underline"
            >
              {att.filename}
            </a>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatSize(att.size)}
            </span>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => handleDelete(att.id)}
              disabled={deletingId === att.id}
            >
              {deletingId === att.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      ))}

      {attachments.length === 0 && (
        <p className="py-2 text-center text-sm text-muted-foreground">
          No attachments yet.
        </p>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept="image/*,.pdf,.txt,.html,.json,.mp4,.webm,.zip,.tar,.gz"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || attachments.length >= 10}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading
            ? "Uploading..."
            : attachments.length >= 10
              ? "Maximum attachments reached"
              : "Upload Attachment"}
        </Button>
      </div>
    </div>
  );
}
