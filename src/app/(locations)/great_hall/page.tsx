"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";

const hallImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/great_hall.png";

export default function GreatHallPage() {
  const [error, setError] = useState<string>("");
  const [dropBanner, setDropBanner] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("great_hall");
        if (res.unlockedCount > 0) {
          setDropBanner(true);
          for (let i = 0; i < res.unlockedCount; i += 1) {
            addNotification("You found a new item in the Great Hall.");
          }
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    try {
      const res = await trackPageClick("great_hall");
      if (res.unlockedCount > 0) {
        setDropBanner(true);
        for (let i = 0; i < res.unlockedCount; i += 1) {
          addNotification("You found a new item in the Great Hall.");
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
        color: "rgba(15, 23, 42, 0.92)",
        background:
          "radial-gradient(1200px 700px at 15% 0%, rgba(255, 210, 179, 0.65), transparent 55%)," +
          "radial-gradient(1000px 650px at 85% 10%, rgba(186, 214, 255, 0.65), transparent 60%)," +
          "radial-gradient(900px 600px at 55% 25%, rgba(203, 255, 227, 0.40), transparent 55%)," +
          "linear-gradient(180deg, rgba(252, 250, 247, 1), rgba(246, 248, 252, 1))",
        minHeight: "calc(100vh - 64px)",
        padding: "40px 20px 64px",
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
            You found a new item in the Great Hall.
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 56,
                  lineHeight: 1.05,
                  letterSpacing: -0.9,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                The Great Hall
              </h1>

              <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.70)" }}>
                A long room of banners and hush, where footsteps sound like decisions. Old trophies gather dust with dignity.
                The air feels curated.
              </p>
              <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.7, color: "rgba(15, 23, 42, 0.70)" }}>
                The echo here is precise, almost rehearsed. The hall expects a ceremony and settles for your footsteps.
              </p>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={hallImg}
                alt="The Vitrine Great Hall"
                width={2000}
                height={1100}
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
            padding: 12,
            borderRadius: 14,
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
