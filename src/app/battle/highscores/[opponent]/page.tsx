"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getAccessToken, restFetch } from "@/lib/supabaseRest";

type Opponent = {
  id: string;
  name: string;
  image_url?: string | null;
};

type OpponentStat = {
  user_id: string;
  wins: number;
};

type Profile = {
  id: string;
  display_name: string | null;
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function OpponentHighscoresPage() {
  const params = useParams();
  const slug = typeof params?.opponent === "string" ? params.opponent : "";
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [rows, setRows] = useState<Array<{ name: string; wins: number }>>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const opponentRows = await restFetch<Opponent[]>("opponents", {
          select: "id,name,image_url",
        });
        const match = (opponentRows ?? []).find((entry) => slugify(entry.name) === slug);
        if (!match) {
          setStatus("Opponent not found.");
          return;
        }
        setOpponent(match);

        const token = getAccessToken();
        const statsRes = await restFetch<OpponentStat[]>(
          "user_opponent_stats",
          {
            select: "user_id,wins",
            opponent_id: `eq.${match.id}`,
            order: "wins.desc",
            limit: "50",
          },
          token ? { token } : undefined
        );

        const userIds = Array.from(new Set((statsRes ?? []).map((row) => row.user_id)));
        let profiles: Profile[] = [];
        if (userIds.length > 0) {
          const profilesRes = await restFetch<Profile[]>("profiles", {
            select: "id,display_name",
            id: `in.(${userIds.join(",")})`,
          });
          profiles = profilesRes ?? [];
        }
        const profileMap = new Map<string, string>();
        profiles.forEach((profile) => {
          if (profile.display_name) {
            profileMap.set(profile.id, profile.display_name);
          }
        });

        const ranked = (statsRes ?? []).map((row) => ({
          name: profileMap.get(row.user_id) ?? "Anonymous",
          wins: row.wins,
        }));
        setRows(ranked);
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load high scores.");
      }
    })();
  }, [slug]);

  const hasResults = rows.length > 0;
  const title = useMemo(() => opponent?.name ?? "Opponent", [opponent]);

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
                fontSize: 34,
                letterSpacing: -0.8,
                lineHeight: 1.1,
                fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
              }}
            >
              {title} high scores
            </h1>
            <Link
              href="/battle/highscores"
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
              All opponents
            </Link>
          </div>
          <p style={{ margin: 0, color: "rgba(15, 23, 42, 0.7)", maxWidth: 720 }}>
            These are the collectors who have claimed the most victories against this foe.
          </p>
        </header>

        {opponent ? (
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(120, 90, 60, 0.22)",
              background: "rgba(255,255,255,0.92)",
              padding: 16,
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 16,
                border: "1px solid rgba(120, 90, 60, 0.18)",
                background: "rgba(255,255,255,0.96)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
              }}
            >
              {opponent.image_url ? (
                <img
                  src={opponent.image_url}
                  alt={opponent.name}
                  style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain" }}
                />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(83, 46, 20, 0.92)" }}>
                {opponent.name}
              </div>
              <div style={{ fontSize: 13, color: "rgba(15, 23, 42, 0.7)" }}>
                Victories recorded across all challengers.
              </div>
            </div>
          </div>
        ) : null}

        {status ? <div style={{ fontSize: 13, color: "rgba(15, 23, 42, 0.7)" }}>{status}</div> : null}

        <section
          style={{
            borderRadius: 18,
            border: "1px solid rgba(120, 90, 60, 0.22)",
            background: "rgba(255,255,255,0.92)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(120, 90, 60, 0.7)" }}>
            Top challengers
          </div>
          {hasResults ? (
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px", gap: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(120, 90, 60, 0.6)" }}>Rank</div>
              <div style={{ fontSize: 12, color: "rgba(120, 90, 60, 0.6)" }}>Collector</div>
              <div style={{ fontSize: 12, color: "rgba(120, 90, 60, 0.6)", textAlign: "right" }}>Wins</div>
              {rows.map((row, index) => (
                <div key={`${row.name}-${index}`} style={{ display: "contents" }}>
                  <div style={{ fontSize: 14, color: "rgba(83, 46, 20, 0.9)" }}>#{index + 1}</div>
                  <div style={{ fontSize: 14, color: "rgba(15, 23, 42, 0.78)" }}>{row.name}</div>
                  <div style={{ fontSize: 14, color: "rgba(15, 23, 42, 0.78)", textAlign: "right" }}>
                    {row.wins}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "rgba(15, 23, 42, 0.7)" }}>
              No victories recorded yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
