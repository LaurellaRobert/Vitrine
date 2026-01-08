"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";

const libraryImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_library.webp";

export default function LibraryPage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("library");
        setUnlockedFromVisit(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    setClicksThisSession((c) => c + 1);

    try {
      const res = await trackPageClick("library");
      if (res.unlockedCount > 0) {
        setUnlockedFromClicks((n) => n + res.unlockedCount);
      }
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  }

  return (
    <main
      onClick={onClickAnywhere}
      style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ margin: 0 }}>Library</h1>
        

          <p style={{ margin: 0, color: "rgba(0,0,0,0.65)", lineHeight: 1.6 }}>
            Dusty shelves, quiet corridors, and the feeling that something is waiting to be found.
            Every visit leaves a trace.
          </p>
        </header>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src={libraryImg}
            alt="The Vitrine Library"
            width={900}
            height={500}
            priority
            style={{ height: "auto" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, color: "rgba(0,0,0,0.65)" }}>
            New unlocks this visit: {unlockedFromVisit}
          </p>

          <p style={{ margin: 0, color: "rgba(0,0,0,0.65)" }}>
            Clicks this session: {clicksThisSession}
          </p>

          <p style={{ margin: 0, color: "rgba(0,0,0,0.65)" }}>
            New unlocks from clicks this session: {unlockedFromClicks}
          </p>

          {error ? (
            <pre style={{ margin: 0, overflowX: "auto" }}>
              {error}
            </pre>
          ) : null}
        </div>
      </div>
    </main>
  );
}
