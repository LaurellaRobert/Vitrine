"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";

const hallImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/great_hall.png";

export default function GreatHallPage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("great_hall");
        setUnlockedFromVisit(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    setClicksThisSession((c) => c + 1);

    try {
      const res = await trackPageClick("great_hall");
      if (res.unlockedCount > 0) setUnlockedFromClicks((n) => n + res.unlockedCount);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  }

  const pill: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "rgba(255,255,255,0.88)",
    color: "rgba(15, 23, 42, 0.86)",
    fontSize: 13,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  };

  const card: CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "rgba(255,255,255,0.82)",
    padding: 18,
  };

  return (
    <main
      onClick={onClickAnywhere}
      style={{
        fontFamily: "system-ui",
        color: "rgba(15, 23, 42, 0.92)",
        background:
          "radial-gradient(1200px 700px at 15% 0%, rgba(255, 210, 179, 0.55), transparent 55%)," +
          "radial-gradient(1000px 650px at 85% 10%, rgba(186, 214, 255, 0.55), transparent 60%)," +
          "radial-gradient(900px 600px at 55% 25%, rgba(203, 255, 227, 0.35), transparent 55%)," +
          "linear-gradient(180deg, rgba(252, 250, 247, 1), rgba(246, 248, 252, 1))",
        minHeight: "calc(100vh - 64px)",
        paddingBottom: 72,
      }}
    >
      {/* Hero */}
      <section style={{ padding: "52px 18px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={hallImg}
              alt="The Vitrine Great Hall"
              width={2400}
              height={1400}
              priority
              style={{
                width: "min(1120px, 100%)",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>

          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                width: "fit-content",
                padding: "9px 14px",
                borderRadius: 999,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                background: "rgba(255,255,255,0.88)",
                fontSize: 13,
                color: "rgba(15, 23, 42, 0.74)",
              }}
            >
              Location: Great Hall
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 64,
                lineHeight: 1.02,
                letterSpacing: -1.2,
              }}
            >
              The Great Hall
            </h1>

            <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                A long room of banners and hush, where footsteps sound like decisions. Old trophies gather dust with
                dignity. The air feels curated in the way a museum feels curated, except no one admits they did the
                curating.
              </p>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                Some displays are inert. Some are not. Attention counts here. Not the loud kind, just the quiet kind
                that keeps returning.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              <span style={{ ...pill, background: "rgba(255, 235, 215, 0.88)" }}>
                <span style={{ opacity: 0.78 }}>New unlocks (visit)</span>
                <strong style={{ fontWeight: 800 }}>{unlockedFromVisit}</strong>
              </span>

              <span style={{ ...pill, background: "rgba(224, 241, 255, 0.88)" }}>
                <span style={{ opacity: 0.78 }}>Clicks</span>
                <strong style={{ fontWeight: 800 }}>{clicksThisSession}</strong>
              </span>

              <span style={{ ...pill, background: "rgba(226, 255, 238, 0.88)" }}>
                <span style={{ opacity: 0.78 }}>New unlocks (clicks)</span>
                <strong style={{ fontWeight: 800 }}>{unlockedFromClicks}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Space */}
      <div style={{ height: 44 }} />

      {/* Content */}
      <section style={{ padding: "0 18px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div style={{ ...card, background: "rgba(255, 235, 215, 0.62)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Whisper</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                A plaque reads: “Objects remember hands.” The ink looks fresh enough to be suspicious.
              </div>
            </div>

            <div style={{ ...card, background: "rgba(224, 241, 255, 0.62)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Rule</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                Visits and clicks can unlock items. There is no undo, and that is the point.
              </div>
            </div>

            <div style={{ ...card, background: "rgba(226, 255, 238, 0.62)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Hint</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                Tap around, then leave. Come back later. The hall prefers patience.
              </div>
            </div>
          </div>

          {error ? (
            <pre
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(220, 38, 38, 0.18)",
                background: "rgba(255, 229, 229, 0.75)",
                color: "rgba(127, 29, 29, 0.92)",
                overflowX: "auto",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {error}
            </pre>
          ) : null}
        </div>
      </section>
    </main>
  );
}
