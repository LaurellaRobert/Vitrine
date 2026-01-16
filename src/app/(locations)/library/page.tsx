"use client";

import { useEffect, useState } from "react";
import { trackPageClick, trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";

const libraryBackground =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_library_large.webp";

export default function LibraryPage() {
  const [error, setError] = useState<string>("");
  const [dropBanner, setDropBanner] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sparkleSeed, setSparkleSeed] = useState(0);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
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
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
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

  const sparklePosition = (offset: number, min: number, max: number) => {
    const value = Math.abs(Math.sin(sparkleSeed + offset)) % 1;
    return `${min + value * (max - min)}%`;
  };

  return (
    <main
      onClick={onClickAnywhere}
      style={{
        color: "rgba(30, 41, 59, 0.92)",
        position: "relative",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${libraryBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <section style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <div
            onMouseEnter={() => {
              setDetailsOpen(true);
              setSparkleSeed(Math.random() * 1000);
            }}
            onMouseLeave={() => setDetailsOpen(false)}
            style={{
              alignSelf: "flex-start",
              width: "min(560px, 100%)",
              maxWidth: "100%",
              padding: detailsOpen ? "16px 18px" : "10px 14px",
              borderRadius: 18,
              border: "1px solid rgba(120, 170, 156, 0.45)",
              background: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 12px 30px rgba(20, 40, 32, 0.15)",
              transition: "all 220ms ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="library-sparkles"
              aria-hidden="true"
              style={{ opacity: detailsOpen ? 1 : 0 }}
            >
              <svg className="library-sparkle library-sparkle--one" viewBox="0 0 100 100">
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
              <svg className="library-sparkle library-sparkle--two" viewBox="0 0 100 100">
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
              <svg className="library-sparkle library-sparkle--three" viewBox="0 0 100 100">
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
              <svg
                className="library-sparkle library-sparkle--micro library-sparkle--micro-one"
                viewBox="0 0 100 100"
                style={{
                  top: sparklePosition(1.2, 8, 28),
                  left: sparklePosition(2.4, 38, 62),
                }}
              >
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
              <svg
                className="library-sparkle library-sparkle--micro library-sparkle--micro-two"
                viewBox="0 0 100 100"
                style={{
                  bottom: sparklePosition(3.6, 18, 38),
                  left: sparklePosition(4.8, 6, 22),
                }}
              >
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
              <svg
                className="library-sparkle library-sparkle--micro library-sparkle--micro-three"
                viewBox="0 0 100 100"
                style={{
                  top: sparklePosition(6.1, 58, 78),
                  right: sparklePosition(7.3, 6, 20),
                }}
              >
                <polygon points="50,0 62,36 100,50 62,64 50,100 38,64 0,50 38,36" />
              </svg>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 52,
                lineHeight: 1.05,
                letterSpacing: -0.9,
                fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                position: "relative",
                zIndex: 2,
              }}
            >
              Library
              <span
                className={detailsOpen ? "library-glint library-glint--active" : "library-glint"}
                aria-hidden="true"
              />
            </h1>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: detailsOpen ? 12 : 0,
                maxHeight: detailsOpen ? 220 : 0,
                opacity: detailsOpen ? 1 : 0,
                overflow: "hidden",
                transition: "all 220ms ease",
                position: "relative",
                zIndex: 2,
              }}
            >
              <p style={{ margin: 0, color: "rgba(30, 41, 59, 0.70)", lineHeight: 1.7 }}>
                Dusty shelves, quiet corridors, and the feeling that something is waiting to be found.
                Every visit leaves a trace.
              </p>
              <p style={{ margin: 0, color: "rgba(30, 41, 59, 0.70)", lineHeight: 1.7 }}>
                Pages crackle softly when you pass. Some spines are warm, as if recently handled.
              </p>
            </div>
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 240, display: "grid", gap: 12 }}>
            {dropBanner ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(191, 147, 102, 0.4)",
                  background: "rgba(255, 245, 228, 0.9)",
                  color: "rgba(92, 45, 12, 0.9)",
                  fontSize: 14,
                }}
              >
                You found a new item in the Library.
              </div>
            ) : null}
            {error ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  background: "rgba(255, 229, 229, 0.8)",
                  color: "rgba(127, 29, 29, 0.9)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <style jsx global>{`
        .library-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          transition: opacity 200ms ease;
          mix-blend-mode: screen;
        }
        .library-sparkle {
          position: absolute;
          width: 28px;
          height: 28px;
          fill: rgba(255, 246, 214, 1);
          filter: drop-shadow(0 0 16px rgba(255, 234, 177, 0.95));
          animation: sparkleFloat 1.6s ease-in-out infinite;
        }
        .library-sparkle--one {
          top: 6px;
          right: 14px;
          animation-delay: 0s;
        }
        .library-sparkle--two {
          top: 52px;
          left: 8px;
          width: 22px;
          height: 22px;
          animation-delay: 0.3s;
        }
        .library-sparkle--three {
          bottom: 10px;
          right: 26px;
          width: 34px;
          height: 34px;
          animation-delay: 0.6s;
        }
        .library-sparkle--micro {
          width: 10px;
          height: 10px;
          fill: rgba(255, 255, 255, 0.9);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
          animation: sparkleFlicker 1.2s ease-in-out infinite;
        }
        .library-sparkle--micro-one {
          animation-delay: 0.1s;
        }
        .library-sparkle--micro-two {
          animation-delay: 0.5s;
        }
        .library-sparkle--micro-three {
          animation-delay: 0.9s;
        }
        .library-glint {
          position: absolute;
          top: -20%;
          left: -30%;
          width: 40%;
          height: 140%;
          background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%);
          transform: translateX(-120%);
          opacity: 0;
          pointer-events: none;
          filter: blur(1px);
        }
        .library-glint--active {
          opacity: 1;
          animation: glintSweep 1.2s ease-out;
        }
        @keyframes sparkleFloat {
          0%,
          100% {
            transform: translateY(0) scale(0.95) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) scale(1.25) rotate(12deg);
            opacity: 1;
          }
        }
        @keyframes sparkleFlicker {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.9;
          }
        }
        @keyframes glintSweep {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(260%);
          }
        }
      `}</style>
    </main>
  );
}
