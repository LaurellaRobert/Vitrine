"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { restFetch } from "@/lib/supabaseRest";

type LeaderboardRow = {
  user_id: string;
  username: string | null;
  collected_count: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchInFlightRef = useRef(false);

  useEffect(() => {
    return () => {
    };
  }, []);

  useEffect(() => {
    const withTimeout = async <T,>(promise: Promise<T>, label: string, ms = 8000) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
      });
      try {
        return await Promise.race([promise, timeout]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    const fetchData = async (reason: string) => {
      if (fetchInFlightRef.current) {
        return;
      }
      fetchInFlightRef.current = true;
      try {
        setLoading(true);
        const res = await withTimeout(
          restFetch<LeaderboardRow[]>("leaderboard_view", {
            select: "user_id,username,collected_count",
            order: "collected_count.desc",
            limit: "25",
          }),
          "leaderboard_view.select"
        );

        setRows((res ?? []) as LeaderboardRow[]);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
        fetchInFlightRef.current = false;
      }
    };

    fetchData("mount");

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchData("visible");
      }
    }

    function handleFocus() {
      fetchData("focus");
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const styles: Record<string, CSSProperties> = {
    page: {
      color: "rgba(15, 23, 42, 0.92)",
      background:
        "radial-gradient(1200px 700px at 12% 0%, rgba(255, 234, 198, 0.6), transparent 60%)," +
        "radial-gradient(900px 650px at 88% 18%, rgba(255, 242, 215, 0.65), transparent 62%)," +
        "linear-gradient(180deg, rgba(252, 249, 244, 1), rgba(244, 238, 228, 1))",
      minHeight: "calc(100vh - 64px)",
      padding: "46px 20px 72px",
    },
    shell: {
      maxWidth: 1200,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },
    title: {
      margin: 0,
      fontSize: 42,
      letterSpacing: -0.9,
      lineHeight: 1.1,
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },
    subtitle: {
      margin: 0,
      maxWidth: 760,
      color: "rgba(15, 23, 42, 0.7)",
      lineHeight: 1.7,
      fontSize: 16,
    },
    caseOuter: {
      position: "relative",
      borderRadius: 26,
      padding: 22,
      border: "1px solid rgba(212, 172, 93, 0.6)",
      background:
        "linear-gradient(145deg, rgba(255, 231, 177, 0.98), rgba(204, 156, 66, 0.95))",
      boxShadow: "0 18px 40px rgba(150, 110, 35, 0.22)",
      overflow: "hidden",
      maxWidth: 1040,
      margin: "0 auto",
    },
    goldGrain: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: 0.45,
      background:
        "radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.55), transparent 45%)," +
        "radial-gradient(circle at 85% 30%, rgba(255, 244, 205, 0.5), transparent 50%)," +
        "repeating-linear-gradient(100deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, rgba(160, 118, 34, 0.15) 3px, rgba(160, 118, 34, 0.15) 7px)",
    },
    caseInner: {
      position: "relative",
      borderRadius: 18,
      border: "1px solid rgba(210, 168, 82, 0.55)",
      padding: 18,
      background:
        "linear-gradient(160deg, rgba(255, 246, 214, 0.98), rgba(229, 187, 98, 0.98))",
    },
    plaque: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(212, 172, 93, 0.6)",
      background: "rgba(255, 250, 232, 0.85)",
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: "rgba(92, 60, 20, 0.8)",
      alignSelf: "flex-start",
    },
    table: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    row: {
      display: "grid",
      gridTemplateColumns: "56px 1fr 120px",
      gap: 10,
      alignItems: "center",
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(210, 168, 82, 0.5)",
      background: "rgba(255,255,255,0.86)",
    },
    rank: {
      fontSize: 14,
      color: "rgba(92, 60, 20, 0.85)",
      fontWeight: 700,
    },
    name: {
      fontSize: 15,
      fontWeight: 600,
      color: "rgba(46, 28, 8, 0.9)",
    },
    count: {
      justifySelf: "end",
      fontSize: 14,
      color: "rgba(92, 60, 20, 0.75)",
      fontWeight: 600,
    },
    loading: {
      padding: 14,
      borderRadius: 12,
      border: "1px solid rgba(123, 92, 42, 0.22)",
      background: "rgba(255,255,255,0.8)",
      color: "rgba(92, 60, 20, 0.7)",
    },
    error: {
      marginTop: 12,
      padding: 12,
      borderRadius: 14,
      border: "1px solid rgba(220, 38, 38, 0.18)",
      background: "rgba(255, 229, 229, 0.75)",
      color: "rgba(127, 29, 29, 0.92)",
      overflowX: "auto",
      fontSize: 12,
      lineHeight: 1.5,
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={styles.plaque}>Leaderboard</div>
          <h1 style={styles.title}>The Trophy Case</h1>
          <p style={styles.subtitle}>
            A hall of collectors. Names carved into the gold by the weight of their discoveries.
          </p>
        </header>

        <section style={styles.caseOuter}>
          <div style={styles.goldGrain} aria-hidden="true" />
          <div style={styles.caseInner}>
            {loading ? (
              <div style={styles.loading}>Loading rankings…</div>
            ) : (
              <div style={styles.table}>
                {rows.map((row, idx) => (
                  <div key={row.user_id} style={styles.row}>
                    <div style={styles.rank}>#{idx + 1}</div>
                    <div style={styles.name}>
                      {row.username ? (
                        <Link
                          href={`/u/${encodeURIComponent(row.username)}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {row.username}
                        </Link>
                      ) : (
                        row.user_id
                      )}
                    </div>
                    <div style={styles.count}>{row.collected_count} items</div>
                  </div>
                ))}
              </div>
            )}

            {error ? <pre style={styles.error}>{error}</pre> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
