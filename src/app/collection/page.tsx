"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  name: string;
  sort_order: number | null;
  image_url: string | null;
};

type CollectedRow = {
  item_id: string;
};

export default function CollectionPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const collectedCount = collected.size;
  const totalCount = items.length;

  const pct = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((collectedCount / totalCount) * 100);
  }, [collectedCount, totalCount]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;

        if (!authData.user) {
          setError("Not signed in. Go to /login");
          return;
        }

        const itemsRes = await supabase
          .from("items")
          .select("id,name,sort_order,image_url")
          .order("sort_order", { ascending: true });

        if (itemsRes.error) throw itemsRes.error;

        const collectedRes = await supabase.from("user_collected_items").select("item_id");
        if (collectedRes.error) throw collectedRes.error;

        setItems(itemsRes.data ?? []);
        setCollected(new Set<string>((collectedRes.data ?? []).map((r: CollectedRow) => r.item_id)));
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    page: {
      maxWidth: 980,
      margin: "36px auto",
      padding: "0 16px 40px",
      fontFamily: "system-ui",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 18,
    },
    titleRow: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    h1: { margin: 0, fontSize: 28, letterSpacing: 0.2 },
    count: { color: "rgba(0,0,0,0.65)", fontSize: 14 },
    flavor: {
      margin: 0,
      color: "rgba(0,0,0,0.70)",
      lineHeight: 1.55,
      maxWidth: 780,
    },
    progressWrap: {
      marginTop: 10,
      padding: 12,
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.10)",
      background: "rgba(0,0,0,0.02)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    progressText: { fontSize: 14 },
    barOuter: {
      height: 10,
      width: 260,
      borderRadius: 999,
      background: "rgba(0,0,0,0.10)",
      overflow: "hidden",
    },
    barInner: {
      height: "100%",
      borderRadius: 999,
      background: "rgba(0,0,0,0.55)",
      width: `${pct}%`,
    },
    error: {
      marginTop: 14,
      padding: 12,
      background: "#111",
      color: "#fff",
      borderRadius: 10,
      overflowX: "auto",
      fontSize: 13,
    },
    grid: {
      marginTop: 16,
      display: "grid",
      gap: 10,
      gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
    },
    slot: {
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.12)",
      background: "rgba(255,255,255,0.9)",
      padding: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 118,
      userSelect: "none",
    },
    imgWrap: {
      width: 72,
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 1.2,
      color: "rgba(0,0,0,0.70)",
      maxWidth: 90,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    placeholder: {
      width: 72,
      height: 72,
      borderRadius: 12,
      border: "1px dashed rgba(0,0,0,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      color: "rgba(0,0,0,0.55)",
    },
    footer: { marginTop: 18 },
    link: { color: "inherit" },
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.h1}>Collection</h1>
          <div style={styles.count}>
            {loading ? "Loading…" : `${collectedCount} / ${totalCount} collected`}
          </div>
        </div>

        <p style={styles.flavor}>
          A record of what has been found so far. Uncollected items stay visible, but faded and grayscale.
        </p>

        <div style={styles.progressWrap}>
          <div style={styles.progressText}>
            <strong>
              {collectedCount} / {totalCount} ({pct}%)
            </strong>
          </div>
          <div style={styles.barOuter} aria-hidden="true">
            <div style={styles.barInner} />
          </div>
        </div>

        {error ? <pre style={styles.error}>{error}</pre> : null}
      </header>

      <section style={styles.grid}>
        {items.map((item, idx) => {
          const isCollected = collected.has(item.id);

          return (
            <div key={item.id} style={styles.slot} title={item.name}>
              <div style={styles.imgWrap}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={72}
                    height={72}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "contain",
                      filter: isCollected ? "none" : "grayscale(100%)",
                      opacity: isCollected ? 1 : 0.28,
                    }}
                  />
                ) : (
                  <div style={styles.placeholder}>{`#${idx + 1}`}</div>
                )}
              </div>

              <div
                style={{
                  ...styles.label,
                  opacity: isCollected ? 1 : 0.55,
                }}
              >
                {item.name}
              </div>
            </div>
          );
        })}
      </section>

      <footer style={styles.footer}>
        <a href="/library" style={styles.link}>
          Go to Library
        </a>
      </footer>
    </main>
  );
}
