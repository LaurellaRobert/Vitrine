"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";

const gardenImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/garden.webp";

export default function GardenPage() {
  const [unlockedFromVisit, setUnlockedFromVisit] = useState<number>(0);
  const [unlockedFromClicks, setUnlockedFromClicks] = useState<number>(0);
  const [clicksThisSession, setClicksThisSession] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("garden");
        setUnlockedFromVisit(res.unlockedCount);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    setClicksThisSession((c) => c + 1);

    try {
      const res = await trackPageClick("garden");
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
    border: "1px solid rgba(22, 84, 52, 0.14)",
    background: "rgba(255,255,255,0.88)",
    color: "rgba(16, 72, 45, 0.88)",
    fontSize: 13,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  };

  const card: CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(22, 84, 52, 0.14)",
    background: "rgba(255,255,255,0.82)",
    padding: 18,
  };

  return (
    <main
      onClick={onClickAnywhere}
      style={{
        fontFamily: "system-ui",
        color: "rgba(16, 72, 45, 0.92)",
        background:
          "radial-gradient(1200px 720px at 12% 0%, rgba(201, 245, 213, 0.65), transparent 58%)," +
          "radial-gradient(1000px 650px at 90% 10%, rgba(232, 248, 221, 0.6), transparent 60%)," +
          "radial-gradient(900px 600px at 45% 35%, rgba(198, 230, 255, 0.35), transparent 56%)," +
          "linear-gradient(180deg, rgba(252, 255, 250, 1), rgba(243, 250, 245, 1))",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: "fit-content",
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(22, 84, 52, 0.14)",
                  background: "rgba(255,255,255,0.88)",
                  fontSize: 13,
                  color: "rgba(16, 72, 45, 0.76)",
                }}
              >
                Location: Garden
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 62,
                  lineHeight: 1.02,
                  letterSpacing: -1.1,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                The Garden
              </h1>

              <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(16, 72, 45, 0.74)" }}>
                  Paths drift on purpose. Leaves arrange themselves into patterns. The air smells like clean rain.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(16, 72, 45, 0.74)" }}>
                  The Garden rewards patience. The longer you linger, the more it offers to those who notice.
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
                <span style={{ ...pill, background: "rgba(214, 246, 224, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>New unlocks (visit)</span>
                  <strong style={{ fontWeight: 800 }}>{unlockedFromVisit}</strong>
                </span>

                <span style={{ ...pill, background: "rgba(233, 250, 222, 0.9)" }}>
                  <span style={{ opacity: 0.78 }}>Clicks</span>
                  <strong style={{ fontWeight: 800 }}>{clicksThisSession}</strong>
                </span>

                <span style={{ ...pill, background: "rgba(210, 238, 255, 0.85)" }}>
                  <span style={{ opacity: 0.78 }}>New unlocks (clicks)</span>
                  <strong style={{ fontWeight: 800 }}>{unlockedFromClicks}</strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={gardenImg}
                alt="The Vitrine Garden"
                width={2400}
                height={1400}
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

      <div style={{ height: 40 }} />

      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 14 }}>
              <div style={{ ...card, background: "rgba(214, 246, 224, 0.68)" }}>
                <div style={{ fontSize: 12, color: "rgba(16, 72, 45, 0.58)" }}>Found</div>
                <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(16, 72, 45, 0.86)" }}>
                  A gate with no lock. A stone bench warmed by sun. A path that returns you gently.
                </div>
              </div>

              <div style={{ ...card, background: "rgba(233, 250, 222, 0.68)" }}>
                <div style={{ fontSize: 12, color: "rgba(16, 72, 45, 0.58)" }}>Rule</div>
                <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(16, 72, 45, 0.86)" }}>
                  Visits count. Clicks count. Stillness counts if you pay attention.
                </div>
              </div>

              <div style={{ ...card, background: "rgba(210, 238, 255, 0.62)" }}>
                <div style={{ fontSize: 12, color: "rgba(16, 72, 45, 0.58)" }}>Hint</div>
                <div style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: "rgba(16, 72, 45, 0.86)" }}>
                  Click along the hedges and the fountain rim. The Garden remembers gestures.
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

          <div style={{ flex: "1 1 560px", minWidth: 360 }} />
        </div>
      </section>
    </main>
  );
}
