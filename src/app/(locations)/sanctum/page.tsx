"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserId } from "@/lib/supabaseRest";

const sanctumImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/sanctum.png";

export default function SanctumPage() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setStatus("Sign in to meet your familiar.");
    }
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui",
        color: "rgba(34, 52, 80, 0.92)",
        background:
          "radial-gradient(1200px 720px at 12% 0%, rgba(214, 225, 242, 0.55), transparent 60%)," +
          "radial-gradient(900px 620px at 88% 18%, rgba(225, 236, 255, 0.45), transparent 62%)," +
          "linear-gradient(180deg, rgba(248, 250, 255, 1), rgba(236, 241, 250, 1))",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 58,
                  lineHeight: 1.02,
                  letterSpacing: -1.1,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                The Familiar Sanctum
              </h1>

              <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(34, 52, 80, 0.74)" }}>
                  A quiet loft of soft light and woven charms. Here, your familiar rests, listens, and learns.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(34, 52, 80, 0.74)" }}>
                  Return often to train, to bond, and to study the way it grows.
                </p>
              </div>

              {status ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(120, 140, 180, 0.35)",
                    background: "rgba(255, 255, 255, 0.85)",
                    fontSize: 14,
                  }}
                >
                  {status}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: 8,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(120, 140, 180, 0.35)",
                  background: "rgba(255, 255, 255, 0.9)",
                  fontSize: 14,
                }}
              >
                Enter the sanctum to view your familiar.
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 560px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(34, 52, 80, 0.6)" }}>
                  Sanctum
                </div>
                <Link href="/sanctum/familiar" style={{ display: "block" }}>
                  <Image
                    src={sanctumImg}
                    alt="Familiar sanctum"
                    width={1600}
                    height={1000}
                    priority
                    style={{
                      width: "min(520px, 100%)",
                      height: "auto",
                      display: "block",
                      borderRadius: 24,
                    }}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
