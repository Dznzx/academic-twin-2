// src/hooks/useAnalytics.ts
"use client";
import { useState, useEffect } from "react";
import { UserAnalytics } from "@/types";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setAnalytics(d.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { analytics, loading, error };
}
