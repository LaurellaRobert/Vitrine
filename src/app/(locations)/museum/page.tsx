"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit, trackTimeOnPage } from "@/lib/track";

const museumImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_museum2.png";

export default function MuseumPage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [unlockedFromTime, setUnlockedFromTime] = useState<number>(0); // not rendered
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("museum");
        setUnlockedFromVisit(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  // Time-on-page unlock: fires once after 30 seconds on this page (not rendered)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await trackTimeOnPage("museum:30s");
        setUnlockedFromTime(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    }, 30_000);

    return () => clearTimeout(timer);
  }, []);

  async function onClickAnywhere() {
    setClicksThisSession((c) => c + 1);

    try {
      const res = await trackPageClick("museum");
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
          <h1 style={{ margin: 0 }}>Museum</h1>

          <p style={{ margin: 0, color: "rgba(0,0,0,0.65)", lineHeight: 1.6 }}>
            Quiet halls, polished stone, and exhibits that look like they have been waiting longer than you have.
            Every visit leaves a trace.
          </p>
        </header>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src={museumImg}
            alt="The Vitrine Museum"
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

          {error ? <pre style={{ margin: 0, overflowX: "auto" }}>{error}</pre> : null}
        </div>
      </div>
    </main>
  );
}
