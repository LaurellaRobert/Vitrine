"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { restFetch } from "@/lib/supabaseRest";

type Opponent = {
  id: string;
  name: string;
  hp: number;
  strength: number;
  defense: number;
  speed: number;
  image_url?: string | null;
};

export default function OpponentGalleryPage() {
  const router = useRouter();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [status, setStatus] = useState("");

  const beginBattle = (opponentId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("battle_active", "1");
    }
    router.push(`/battle?opponent=${opponentId}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await restFetch<Opponent[]>("opponents", {
          select: "id,name,hp,strength,defense,speed,image_url",
          order: "hp.desc",
        });
        setOpponents((res ?? []) as Opponent[]);
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load opponents.");
      }
    })();
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    page: {
      color: "rgba(15, 23, 42, 0.92)",
      background:
        "radial-gradient(1200px 720px at 12% 0%, rgba(231, 224, 204, 0.55), transparent 60%)," +
        "radial-gradient(900px 600px at 88% 18%, rgba(255, 234, 208, 0.45), transparent 62%)," +
        "linear-gradient(180deg, rgba(252, 249, 244, 1), rgba(246, 243, 235, 1))",
      minHeight: "calc(100vh - 64px)",
      padding: "46px 20px 72px",
    },
    shell: {
      maxWidth: 960,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },
    title: {
      margin: 0,
      fontSize: 38,
      letterSpacing: -0.8,
      lineHeight: 1.1,
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },
    subtitle: {
      margin: 0,
      color: "rgba(15, 23, 42, 0.7)",
      lineHeight: 1.7,
      maxWidth: 680,
    },
    grid: {
      display: "grid",
      gap: 16,
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    },
    card: {
      borderRadius: 16,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.92)",
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "center",
      textAlign: "center",
    },
    portrait: {
      width: "min(160px, 100%)",
      borderRadius: 14,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.95)",
      padding: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    portraitImg: {
      width: "100%",
      height: "auto",
      display: "block",
      borderRadius: 10,
    },
    name: {
      fontSize: 16,
      fontWeight: 700,
      color: "rgba(83, 46, 20, 0.92)",
    },
    statRow: {
      fontSize: 13,
      color: "rgba(15, 23, 42, 0.7)",
    },
    button: {
      marginTop: 6,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 12px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 235, 206, 1)",
      textDecoration: "none",
      color: "rgba(72, 42, 18, 0.92)",
      fontSize: 13,
      fontWeight: 600,
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={styles.title}>Battle Opponents</h1>
          <p style={styles.subtitle}>
            Choose an opponent before you enter the ring.
          </p>
        </header>

        {status ? <div style={{ color: "rgba(127, 29, 29, 0.9)" }}>{status}</div> : null}

        <section style={styles.grid}>
          {opponents.map((opponent) => (
            <div key={opponent.id} style={styles.card}>
              {opponent.image_url ? (
                <div style={styles.portrait}>
                  <img src={opponent.image_url} alt={opponent.name} style={styles.portraitImg} />
                </div>
              ) : null}
              <div style={styles.name}>{opponent.name}</div>
              <div style={styles.statRow}>
                HP {opponent.hp} · STR {opponent.strength} · DEF {opponent.defense} · SPD {opponent.speed}
              </div>
              <button type="button" style={styles.button} onClick={() => beginBattle(opponent.id)}>
                Challenge
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
