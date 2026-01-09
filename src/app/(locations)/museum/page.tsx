"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { trackPageClick, trackPageVisit, trackTimeOnPage } from "@/lib/track";



const museumImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_museum2.png";

export default function MuseumPage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [unlockedFromTime, setUnlockedFromTime] = useState<number>(0);
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const pill: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(51, 65, 85, 0.18)",
    background: "rgba(255,255,255,0.88)",
    color: "rgba(30, 41, 59, 0.86)",
    fontSize: 13,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  };

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

  // Time-on-page unlock: fires once after 60 seconds on this page (not rendered)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await trackTimeOnPage("museum:60s");
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
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "46px 20px 72px",
        fontFamily: "system-ui",
        color: "rgba(30, 41, 59, 0.92)",
      }}
    >
      <section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: "fit-content",
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(51, 65, 85, 0.18)",
                  background: "rgba(255,255,255,0.88)",
                  fontSize: 13,
                  color: "rgba(30, 41, 59, 0.76)",
                }}
              >
                Location: Museum
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 56,
                  lineHeight: 1.05,
                  letterSpacing: -0.9,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                Museum
              </h1>

              <p style={{ margin: 0, color: "rgba(30, 41, 59, 0.70)", lineHeight: 1.7, maxWidth: 520 }}>
                Quiet halls, polished stone, and exhibits that look like they have been waiting longer than you have.
                Every visit leaves a trace.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
                <span style={{ ...pill, background: "rgba(226, 234, 252, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>New unlocks (visit)</span>
                  <strong style={{ fontWeight: 800 }}>{unlockedFromVisit}</strong>
                </span>

                <span style={{ ...pill, background: "rgba(239, 242, 255, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>Clicks</span>
                  <strong style={{ fontWeight: 800 }}>{clicksThisSession}</strong>
                </span>

                <span style={{ ...pill, background: "rgba(221, 241, 234, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>New unlocks (clicks)</span>
                  <strong style={{ fontWeight: 800 }}>{unlockedFromClicks}</strong>
                </span>

                <span style={{ ...pill, background: "rgba(223, 236, 255, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>New unlocks (time)</span>
                  <strong style={{ fontWeight: 800 }}>{unlockedFromTime}</strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={museumImg}
                alt="The Vitrine Museum"
                width={900}
                height={500}
                priority
                style={{
                  width: "min(720px, 100%)",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {error ? <pre style={{ marginTop: 16, overflowX: "auto" }}>{error}</pre> : null}
    </main>
  );
}
