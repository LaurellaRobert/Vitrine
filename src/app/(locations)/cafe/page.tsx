"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";

const cafeImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/cafe.png";

export default function CafePage() {
  const [error, setError] = useState<string>("");
  const [dropBanner, setDropBanner] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("cafe");
        if (res.unlockedCount > 0) {
          setDropBanner(true);
          for (let i = 0; i < res.unlockedCount; i += 1) {
            addNotification("You found a new item in the Cafe.");
          }
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    try {
      const res = await trackPageClick("cafe");
      if (res.unlockedCount > 0) {
        setDropBanner(true);
        for (let i = 0; i < res.unlockedCount; i += 1) {
          addNotification("You found a new item in the Cafe.");
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
        color: "rgba(63, 35, 12, 0.92)",
        background:
          "radial-gradient(1200px 720px at 20% 0%, rgba(255, 223, 199, 0.65), transparent 58%)," +
          "radial-gradient(1000px 650px at 88% 12%, rgba(214, 178, 142, 0.55), transparent 60%)," +
          "radial-gradient(900px 600px at 55% 30%, rgba(255, 247, 228, 0.7), transparent 56%)," +
          "linear-gradient(180deg, rgba(255, 252, 248, 1), rgba(250, 245, 238, 1))",
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
            You found a new item in the Cafe.
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
                The Cafe
              </h1>

              <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(63, 35, 12, 0.74)" }}>
                  Steam curls from ceramic cups. The counter glows warm. Conversation lingers like sugar on the rim.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(63, 35, 12, 0.74)" }}>
                  The Cafe keeps time in refills and return visits. Some secrets only surface when you sit awhile.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(63, 35, 12, 0.74)" }}>
                  Even the mugs seem to remember who last held them. The steam carries rumors you can almost hear.
                </p>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={cafeImg}
                alt="The Vitrine Cafe"
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
