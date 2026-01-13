"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { restFetch } from "@/lib/supabaseRest";

type Opponent = {
  id: string;
  name: string;
  image_url?: string | null;
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function BattleHighscoresPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await restFetch<Opponent[]>("opponents", {
          select: "id,name,image_url",
          order: "name.asc",
        });
        setOpponents(res ?? []);
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load opponents.");
      }
    })();
  }, []);

  const tiles = useMemo(() => opponents, [opponents]);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
        background:
          "radial-gradient(1200px 720px at 12% 0%, rgba(231, 224, 204, 0.55), transparent 60%)," +
          "radial-gradient(900px 600px at 88% 18%, rgba(255, 234, 208, 0.45), transparent 62%)," +
          "linear-gradient(180deg, rgba(252, 249, 244, 1), rgba(246, 243, 235, 1))",
        color: "rgba(15, 23, 42, 0.92)",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                letterSpacing: -0.8,
                lineHeight: 1.1,
                fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
              }}
            >
              Battle High Scores
            </h1>
            <Link
              href="/battle"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(120, 90, 60, 0.25)",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                color: "rgba(83, 46, 20, 0.9)",
                textDecoration: "none",
              }}
            >
              Back to arena
            </Link>
          </div>
          <p style={{ margin: 0, color: "rgba(15, 23, 42, 0.7)", maxWidth: 720 }}>
            Each opponent keeps a ledger of champions. Choose a foe to see who has claimed the most victories.
          </p>
        </header>

        {status ? <div style={{ fontSize: 13, color: "rgba(15, 23, 42, 0.7)" }}>{status}</div> : null}

        <section
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {tiles.map((opponent) => {
            const href = `/battle/highscores/${slugify(opponent.name)}`;
            return (
              <Link
                key={opponent.id}
                href={href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: 18,
                  border: "1px solid rgba(120, 90, 60, 0.22)",
                  background: "rgba(255,255,255,0.92)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(120, 90, 60, 0.18)",
                    background: "rgba(255,255,255,0.96)",
                    padding: 12,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 180,
                  }}
                >
                  {opponent.image_url ? (
                    <img
                      src={opponent.image_url}
                      alt={opponent.name}
                      style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ width: 120, height: 120, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                  )}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(83, 46, 20, 0.92)" }}>
                  {opponent.name}
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
