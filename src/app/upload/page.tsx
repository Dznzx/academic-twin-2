// src/app/upload/page.tsx — full documents management page
"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { formatBytes, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/utils";
import { UploadProgress } from "@/types";
import DocumentCard from "@/components/upload/DocumentCard";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({});
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => { fetchDocuments(); }, []);

  async function fetchDocuments() {
    setLoadingDocs(true);
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data.data ?? []);
    setLoadingDocs(false);
  }

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted.filter((f) => !prev.find((p) => p.name === f.name))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function uploadFile(file: File) {
    setProgress((prev) => ({ ...prev, [file.name]: { fileName: file.name, progress: 20, status: "uploading" } }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setProgress((prev) => ({ ...prev, [file.name]: { fileName: file.name, progress: 60, status: "processing" } }));
      fetchDocuments();

      const docId = data.data.id;
      const poll = setInterval(async () => {
        const r = await fetch("/api/documents/" + docId);
        const d = await r.json();
        if (d.data?.status === "READY") {
          clearInterval(poll);
          setProgress((prev) => ({ ...prev, [file.name]: { fileName: file.name, progress: 100, status: "done" } }));
          fetchDocuments();
        } else if (d.data?.status === "FAILED") {
          clearInterval(poll);
          setProgress((prev) => ({ ...prev, [file.name]: { fileName: file.name, progress: 0, status: "error", error: "Processing failed" } }));
        }
      }, 2500);
    } catch (err: any) {
      setProgress((prev) => ({ ...prev, [file.name]: { fileName: file.name, progress: 0, status: "error", error: err.message } }));
    }
  }

  async function uploadAll() {
    for (const file of files) {
      if (progress[file.name]?.status === "done") continue;
      await uploadFile(file);
    }
  }

  async function deleteDocument(id: string) {
    await fetch("/api/documents/" + id, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const statusIcon = (status: string) => {
    if (status === "done") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="mt-1 text-muted-foreground">Upload your study materials to build your knowledge base.</p>
      </div>

      <div
        {...getRootProps()}
        className={["rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary hover:bg-muted/30"
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">{isDragActive ? "Drop files here" : "Drag & drop files, or click to browse"}</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, TXT, MD — up to 50MB each</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">{files.length} file{files.length !== 1 ? "s" : ""} queued</h2>
            <button onClick={uploadAll} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Upload All
            </button>
          </div>
          {files.map((file) => {
            const p = progress[file.name];
            return (
              <div key={file.name} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  {p?.status === "error" && <p className="text-xs text-red-500 mt-0.5">{p.error}</p>}
                  {p && p.status !== "done" && p.status !== "error" && <p className="text-xs text-primary mt-0.5 capitalize">{p.status}...</p>}
                </div>
                {p ? statusIcon(p.status) : (
                  <button onClick={() => removeFile(file.name)} className="rounded p-1 hover:bg-muted transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-4">Your Library ({documents.length})</h2>
        {loadingDocs ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">No documents yet. Upload your first file above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (<DocumentCard key={doc.id} doc={doc} onDelete={deleteDocument} />))}
          </div>
        )}
      </div>
    </div>
  );
}
