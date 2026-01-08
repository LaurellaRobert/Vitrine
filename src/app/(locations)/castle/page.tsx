"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";

const castleImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/Castle_t.png";

export default function CastlePage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("castle");
        setUnlockedFromVisit(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    setClicksThisSession((c) => c + 1);

    try {
      const res = await trackPageClick("castle");
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
          "radial-gradient(1200px 720px at 20% 0%, rgba(214, 200, 255, 0.55), transparent 58%)," +
          "radial-gradient(1000px 650px at 88% 12%, rgba(255, 214, 181, 0.52), transparent 60%)," +
          "radial-gradient(900px 600px at 55% 30%, rgba(205, 245, 255, 0.40), transparent 56%)," +
          "linear-gradient(180deg, rgba(252, 250, 247, 1), rgba(246, 248, 252, 1))",
        minHeight: "calc(100vh - 64px)",
        paddingBottom: 72,
      }}
    >
      <section style={{ padding: "52px 18px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={castleImg}
              alt="The Vitrine Castle"
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
              Location: Castle
            </div>

            <h1 style={{ margin: 0, fontSize: 64, lineHeight: 1.02, letterSpacing: -1.2 }}>
              The Castle
            </h1>

            <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                Stone that remembers weather. Windows that refuse to be friendly. A place that looks like it was built
                for ceremony, then kept for secrets.
              </p>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                Attention works differently here. Some things react to repetition. Some things react to curiosity.
                Either way, the Castle keeps score.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              <span style={{ ...pill, background: "rgba(226, 216, 255, 0.88)" }}>
                <span style={{ opacity: 0.78 }}>New unlocks (visit)</span>
                <strong style={{ fontWeight: 800 }}>{unlockedFromVisit}</strong>
              </span>

              <span style={{ ...pill, background: "rgba(255, 235, 215, 0.88)" }}>
                <span style={{ opacity: 0.78 }}>Clicks</span>
                <strong style={{ fontWeight: 800 }}>{clicksThisSession}</strong>
              </span>

              <span style={{ ...pill, background: "rgba(205, 245, 255, 0.85)" }}>
                <span style={{ opacity: 0.78 }}>New unlocks (clicks)</span>
                <strong style={{ fontWeight: 800 }}>{unlockedFromClicks}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 44 }} />

      <section style={{ padding: "0 18px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div style={{ ...card, background: "rgba(226, 216, 255, 0.62)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Found</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                A narrow stair. A draft. A banner stitched over old damage.
              </div>
            </div>

            <div style={{ ...card, background: "rgba(255, 235, 215, 0.62)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Rule</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                Curiosity counts. Repetition counts. Some doors only open for insistence.
              </div>
            </div>

            <div style={{ ...card, background: "rgba(205, 245, 255, 0.58)" }}>
              <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.58)" }}>Hint</div>
              <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.86)" }}>
                Click around the edges. The Castle likes corners.
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
