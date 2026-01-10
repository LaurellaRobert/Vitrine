"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";

const castleImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/Castle_t.png";

export default function CastlePage() {
  const [error, setError] = useState<string>("");
  const [dropBanner, setDropBanner] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("castle");
        if (res.unlockedCount > 0) {
          setDropBanner(true);
          for (let i = 0; i < res.unlockedCount; i += 1) {
            addNotification("You found a new item in the Castle.");
          }
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    try {
      const res = await trackPageClick("castle");
      if (res.unlockedCount > 0) {
        setDropBanner(true);
        for (let i = 0; i < res.unlockedCount; i += 1) {
          addNotification("You found a new item in the Castle.");
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  }

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
        padding: "46px 20px 72px",
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        {dropBanner ? (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(191, 147, 102, 0.4)",
              background: "rgba(255, 245, 228, 0.9)",
              color: "rgba(92, 45, 12, 0.9)",
              fontSize: 14,
            }}
          >
            You found a new item in the Castle.
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 62,
                  lineHeight: 1.02,
                  letterSpacing: -1.2,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                The Castle
              </h1>

              <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                  Stone that remembers weather. Windows that refuse to be friendly. A place that looks like it was built
                  for ceremony, then kept for secrets.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                  Attention works differently here. Some things react to repetition. Some things react to curiosity.
                  Either way, the Castle keeps score.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(15, 23, 42, 0.74)" }}>
                  Light cuts through the narrow panes and lands where it shouldn’t. The rooms remember names.
                </p>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={castleImg}
                alt="The Vitrine Castle"
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
