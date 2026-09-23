"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ["application/pdf", "text/plain", "application/msword",
       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/documents", { method: "POST", body: form });
        if (!res.ok) throw new Error("Upload failed");
      }
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-6 border-b border-border bg-card shrink-0">
        <Upload className="h-4 w-4 text-muted-foreground mr-2" />
        <h1 className="text-sm font-medium text-foreground">Documents</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground">Upload documents</h2>
            <p className="text-sm text-muted-foreground mt-1">Upload your notes, textbooks, or slides. Supported formats: PDF, DOC, DOCX, TXT.</p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Drop files here or browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT up to 50MB</p>
            <input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={onSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors">
              Browse files
            </button>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
              </div>
              <ul className="divide-y divide-border">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => remove(i)} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                {status === "success" && <span className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle className="h-4 w-4" /> Uploaded successfully</span>}
                {status === "error" && <span className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-4 w-4" /> Upload failed. Try again.</span>}
                {status === "idle" && <span />}
                <button
                  onClick={upload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
