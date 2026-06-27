// src/hooks/useDocuments.ts
"use client";
import { useState, useEffect } from "react";
import { Document } from "@/types";

export function useDocuments(status?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const res = await fetch(`/api/documents${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocuments(data.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocuments(); }, [status]);

  return { documents, loading, error, refetch: fetchDocuments };
}
