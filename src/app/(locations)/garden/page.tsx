"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";

const gardenImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/garden.webp";

export default function GardenPage() {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        await trackPageVisit("garden");
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    try {
      await trackPageClick("garden");
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  }

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
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(16, 72, 45, 0.74)" }}>
                  Water keeps its own calendar here. The hedges whisper and forget just as quickly.
                </p>
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

      {error ? (
        <pre
          style={{
            marginTop: 16,
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
    </main>
  );
}
