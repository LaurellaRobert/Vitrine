"use client";

import { useEffect, useState } from "react";
import { trackPageVisit } from "@/lib/track";

export default function MuseumPage() {
  const [unlocked, setUnlocked] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("museum");
        setUnlocked(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  return (
    <main style={{ padding: "24px 16px" }}>
      <h1>Museum</h1>
      <p>New unlocks this visit: {unlocked}</p>
      {error ? (
        <pre style={{ marginTop: 16, padding: 12, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
          {error}
        </pre>
      ) : null}
    </main>
  );
}