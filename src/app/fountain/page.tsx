"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

export default function FountainPage() {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, active: false });
  const sparkleRef = useRef<HTMLDivElement | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const userId = getUserId();
        if (!token || !userId) {
          setStatus("Sign in to test your worth at the fountain.");
          return;
        }

        const rpc = await restFetch<any>(
          "rpc/try_unlock_achievements",
          {},
          { method: "POST", token }
        );
        const row = Array.isArray(rpc) ? rpc[0] : rpc;
        setUnlockedCount((row as any)?.unlocked_count ?? 0);
      } catch (e: any) {
        setStatus(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let lastSpawn = 0;
    const handleMove = (event: MouseEvent) => {
      if (!sparkleRef.current) return;
      setCursorPos({ x: event.clientX, y: event.clientY, active: true });
      const now = Date.now();
      if (now - lastSpawn < 50) return;
      lastSpawn = now;

      const lastPos = lastPosRef.current;
      const dx = lastPos ? event.clientX - lastPos.x : 0;
      const dy = lastPos ? event.clientY - lastPos.y : 0;
      lastPosRef.current = { x: event.clientX, y: event.clientY };

      const sparkle = document.createElement("span");
      const size = 14 + Math.random() * 18;
      const palette = ["#fef3c7", "#e0f2fe", "#f5d0fe", "#dcfce7", "#ffe4e6"];
      const color = palette[Math.floor(Math.random() * palette.length)];
      sparkle.className = "fountain-sparkle";
      sparkle.style.left = `${event.clientX}px`;
      sparkle.style.top = `${event.clientY}px`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.opacity = `${0.7 + Math.random() * 0.3}`;
      sparkle.style.background = color;
      sparkle.style.setProperty("--sparkle-color", color);
      sparkle.style.setProperty("--sparkle-dx", `${dx * 0.25}px`);
      sparkle.style.setProperty("--sparkle-dy", `${dy * 0.25}px`);
      sparkle.style.transform = `translate(-50%, -50%) scale(${0.6 + Math.random() * 0.8})`;
      sparkle.style.animationDuration = `${1.2 + Math.random()}s`;
      sparkleRef.current.appendChild(sparkle);

      for (let i = 0; i < 3; i += 1) {
        const trail = document.createElement("span");
        const trailSize = 6 + Math.random() * 8;
        trail.className = "fountain-sparkle fountain-sparkle--trail";
        trail.style.left = `${event.clientX - dx * 0.2 + (Math.random() * 18 - 9)}px`;
        trail.style.top = `${event.clientY - dy * 0.2 + (Math.random() * 18 - 9)}px`;
        trail.style.width = `${trailSize}px`;
        trail.style.height = `${trailSize}px`;
        trail.style.opacity = `${0.4 + Math.random() * 0.3}`;
        trail.style.background = color;
        trail.style.setProperty("--sparkle-color", color);
        trail.style.setProperty("--sparkle-dx", `${dx * 0.2}px`);
        trail.style.setProperty("--sparkle-dy", `${dy * 0.2}px`);
        trail.style.transform = `translate(-50%, -50%) scale(${0.6 + Math.random() * 0.6})`;
        trail.style.animationDuration = `${0.9 + Math.random() * 0.8}s`;
        sparkleRef.current.appendChild(trail);
        window.setTimeout(() => {
          trail.remove();
        }, 1400);
      }

      window.setTimeout(() => {
        sparkle.remove();
      }, 1600);
    };

    const handleLeave = () => setCursorPos((prev) => ({ ...prev, active: false }));
    const target = document;
    target.addEventListener("mousemove", handleMove);
    target.addEventListener("mouseleave", handleLeave);
    return () => {
      target.removeEventListener("mousemove", handleMove);
      target.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: "system-ui",
      color: "rgba(230, 233, 239, 0.92)",
      background:
        "radial-gradient(900px 600px at 12% 0%, rgba(42, 74, 58, 0.6), transparent 60%)," +
        "radial-gradient(1200px 700px at 88% 18%, rgba(53, 46, 38, 0.55), transparent 62%)," +
        "radial-gradient(900px 600px at 50% 85%, rgba(26, 52, 40, 0.55), transparent 60%)," +
        "linear-gradient(180deg, rgba(20, 24, 28, 1), rgba(12, 16, 20, 1))",
      minHeight: "calc(100vh - 64px)",
      padding: "46px 20px 72px",
      position: "relative",
      overflow: "hidden",
    },
    shell: {
      maxWidth: 980,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      position: "relative",
      zIndex: 2,
    },
    layout: {
      display: "flex",
      gap: 28,
      alignItems: "flex-start",
    },
    leftCol: {
      flex: "1 1 45%",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingTop: 6,
    },
    rightCol: {
      flex: "1 1 55%",
      display: "flex",
      justifyContent: "center",
    },
    title: {
      margin: 0,
      fontSize: 40,
      letterSpacing: -0.8,
      lineHeight: 1.1,
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },
    subtitle: {
      margin: 0,
      color: "rgba(200, 206, 216, 0.75)",
      lineHeight: 1.7,
      maxWidth: 720,
    },
    banner: {
      borderRadius: 16,
      border: "1px solid rgba(120, 131, 120, 0.35)",
      background: "rgba(18, 24, 28, 0.7)",
      padding: "14px 16px",
      color: "rgba(226, 232, 240, 0.9)",
      fontWeight: 600,
    },
    fountainFrame: {
      position: "relative",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    glow: {
      position: "absolute",
      inset: "-20%",
      background:
        "radial-gradient(circle at 50% 40%, rgba(120, 214, 199, 0.35), transparent 60%)",
      filter: "blur(8px)",
      opacity: 0.7,
      pointerEvents: "none",
      animation: "fountainGlow 8s ease-in-out infinite",
    },
    ripple: {
      position: "absolute",
      left: "50%",
      top: "58%",
      width: 280,
      height: 280,
      borderRadius: 999,
      border: "1px solid rgba(126, 215, 202, 0.35)",
      transform: "translate(-50%, -50%)",
      opacity: 0,
      pointerEvents: "none",
      animation: "fountainRipple 5.5s ease-out infinite",
    },
    dust: {
      position: "absolute",
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "rgba(255, 255, 255, 0.55)",
      boxShadow: "0 0 8px rgba(255,255,255,0.45)",
      pointerEvents: "none",
      animation: "fountainDust 7s ease-in-out infinite",
    },
    pageGlow: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        "radial-gradient(circle at 18% 12%, rgba(82, 140, 110, 0.45), transparent 50%)," +
        "radial-gradient(circle at 82% 24%, rgba(64, 58, 46, 0.45), transparent 55%)",
      animation: "pageGlow 9s ease-in-out infinite",
      zIndex: 0,
    },
    pageRipple: {
      position: "absolute",
      left: "50%",
      top: "35%",
      width: 520,
      height: 520,
      borderRadius: 999,
      border: "1px solid rgba(120, 214, 199, 0.2)",
      transform: "translate(-50%, -50%)",
      opacity: 0,
      pointerEvents: "none",
      animation: "pageRipple 9s ease-out infinite",
      zIndex: 0,
    },
    pageDust: {
      position: "absolute",
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "rgba(200, 240, 230, 0.25)",
      boxShadow: "0 0 10px rgba(200, 240, 230, 0.35)",
      pointerEvents: "none",
      animation: "pageDust 10s ease-in-out infinite",
      zIndex: 0,
    },
    sparkleLayer: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 9999,
      mixBlendMode: "screen",
      isolation: "isolate",
    },
  };

  return (
    <main style={styles.page} className="fountain-page">
      <div style={styles.shell}>
        <section style={styles.layout} className="fountain-layout">
          <div style={styles.leftCol}>
            <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h1 style={styles.title}>Fountain of Achievement</h1>
              <p style={styles.subtitle}>
                Lay your progress at the waters and see which honors rise to the surface.
              </p>
            </header>

            {loading ? (
              <div style={styles.banner}>The waters stir…</div>
            ) : (
              <div style={styles.banner}>
                {status
                  ? status
                  : unlockedCount > 0
                    ? `The fountain grants ${unlockedCount} new ${unlockedCount === 1 ? "trophy" : "trophies"}.`
                    : "The fountain remains still. No new trophies yet."}
              </div>
            )}
          </div>

          <div style={styles.rightCol}>
            <div style={styles.fountainFrame}>
              <div style={styles.glow} aria-hidden="true" />
              <span style={{ ...styles.ripple, animationDelay: "0s" }} aria-hidden="true" />
              <span style={{ ...styles.ripple, animationDelay: "1.8s" }} aria-hidden="true" />
              <span style={{ ...styles.ripple, animationDelay: "3.6s" }} aria-hidden="true" />
              <span style={{ ...styles.dust, top: "18%", left: "18%", animationDelay: "0.2s" }} aria-hidden="true" />
              <span style={{ ...styles.dust, top: "28%", left: "72%", animationDelay: "1.4s" }} aria-hidden="true" />
              <span style={{ ...styles.dust, top: "62%", left: "20%", animationDelay: "2.6s" }} aria-hidden="true" />
              <span style={{ ...styles.dust, top: "74%", left: "70%", animationDelay: "3.2s" }} aria-hidden="true" />
              <Image
                src="https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/fountain.png"
                alt="Fountain of Achievement"
                width={1440}
                height={1440}
                style={{ width: "min(1176px, 98vw)", height: "auto", objectFit: "contain" }}
              />
            </div>
          </div>
        </section>
      </div>
      <div style={styles.pageGlow} aria-hidden="true" />
      <span style={{ ...styles.pageRipple, animationDelay: "0s" }} aria-hidden="true" />
      <span style={{ ...styles.pageRipple, animationDelay: "4.5s" }} aria-hidden="true" />
      <span style={{ ...styles.pageDust, top: "20%", left: "12%", animationDelay: "0.4s" }} aria-hidden="true" />
      <span style={{ ...styles.pageDust, top: "35%", left: "82%", animationDelay: "1.4s" }} aria-hidden="true" />
      <span style={{ ...styles.pageDust, top: "68%", left: "24%", animationDelay: "2.2s" }} aria-hidden="true" />
      <span style={{ ...styles.pageDust, top: "75%", left: "72%", animationDelay: "3.1s" }} aria-hidden="true" />
      <div ref={sparkleRef} style={styles.sparkleLayer} aria-hidden="true">
        {cursorPos.active ? (
          <span
            className="fountain-cursor"
            style={{ left: cursorPos.x, top: cursorPos.y }}
          />
        ) : null}
      </div>
      <style jsx global>{`
        @media (max-width: 900px) {
          .fountain-layout {
            flex-direction: column;
          }
        }
        @keyframes fountainGlow {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.85;
          }
        }
        @keyframes fountainRipple {
          0% {
            transform: translate(-50%, -50%) scale(0.75);
            opacity: 0.45;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.35);
            opacity: 0;
          }
        }
        @keyframes fountainDust {
          0% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-12px);
            opacity: 0.6;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.25;
          }
        }
        @keyframes pageGlow {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.55;
          }
        }
        @keyframes pageRipple {
          0% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0.25;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }
        @keyframes pageDust {
          0% {
            transform: translateY(0px);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0px);
            opacity: 0.18;
          }
        }
        .fountain-sparkle {
          position: absolute;
          border-radius: 999px;
          background: var(--sparkle-color, #ffffff);
          box-shadow: 0 0 22px var(--sparkle-color, #ffffff);
          animation: sparkleFade ease-out forwards;
          clip-path: polygon(
            50% 0%,
            60% 38%,
            100% 50%,
            60% 62%,
            50% 100%,
            40% 62%,
            0% 50%,
            40% 38%
          );
          mix-blend-mode: screen;
        }
        .fountain-sparkle--trail {
          clip-path: polygon(
            50% 0%,
            63% 30%,
            100% 50%,
            63% 70%,
            50% 100%,
            37% 70%,
            0% 50%,
            37% 30%
          );
          filter: blur(0.6px);
          opacity: 0.6;
        }
        @keyframes sparkleFade {
          0% {
            opacity: 0.9;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--sparkle-dx, 0px)), calc(-80% + var(--sparkle-dy, 0px)))
              scale(1.2);
          }
        }
        .fountain-cursor {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(140, 208, 224, 0.4), rgba(255, 255, 255, 0));
          box-shadow: 0 0 16px rgba(170, 235, 255, 0.7);
          transform: translate(-50%, -50%);
          mix-blend-mode: screen;
        }
      `}</style>
    </main>
  );
}
