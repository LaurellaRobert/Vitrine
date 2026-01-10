"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";

const libraryImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_library.webp";

export default function LibraryPage() {
  const [error, setError] = useState<string>("");
  const [dropBanner, setDropBanner] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("library");
        if (res.unlockedCount > 0) {
          setDropBanner(true);
          for (let i = 0; i < res.unlockedCount; i += 1) {
            addNotification("You found a new item in the Library.");
          }
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  async function onClickAnywhere() {
    try {
      const res = await trackPageClick("library");
      if (res.unlockedCount > 0) {
        setDropBanner(true);
        for (let i = 0; i < res.unlockedCount; i += 1) {
          addNotification("You found a new item in the Library.");
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
        maxWidth: 1280,
        margin: "0 auto",
        padding: "46px 20px 72px",
        fontFamily: "system-ui",
        color: "rgba(30, 41, 59, 0.92)",
      }}
    >
      <section>
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
            You found a new item in the Library.
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
                Library
              </h1>

              <p style={{ margin: 0, color: "rgba(30, 41, 59, 0.70)", lineHeight: 1.7, maxWidth: 520 }}>
                Dusty shelves, quiet corridors, and the feeling that something is waiting to be found.
                Every visit leaves a trace.
              </p>
              <p style={{ margin: 0, color: "rgba(30, 41, 59, 0.70)", lineHeight: 1.7, maxWidth: 520 }}>
                Pages crackle softly when you pass. Some spines are warm, as if recently handled.
              </p>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <Image
                src={libraryImg}
                alt="The Vitrine Library"
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
