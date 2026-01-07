"use client";

import { useEffect, useState } from "react";
import { trackPageVisit } from "@/lib/track";

export default function LibraryPage() {
  const [unlocked, setUnlocked] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("library");
        setUnlocked(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Library</h1>
      <p>This page logs a visit, then checks unlock rules.</p>
      <p>New unlocks this visit: {unlocked}</p>
      {error ? <pre style={{ marginTop: 16 }}>{error}</pre> : null}
    </main>
  );
}