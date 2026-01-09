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
      fontFamily: "system-ui",
      color: "rgba(15, 23, 42, 0.92)",
      background:
        "radial-gradient(1200px 720px at 12% 0%, rgba(231, 224, 204, 0.55), transparent 60%)," +
        "radial-gradient(900px 600px at 88% 18%, rgba(255, 234, 208, 0.45), transparent 62%)," +
        "linear-gradient(180deg, rgba(252, 249, 244, 1), rgba(246, 243, 235, 1))",
      minHeight: "calc(100vh - 64px)",
      padding: "46px 20px 72px",
    },

    shell: {
      maxWidth: 1280,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    header: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "0 2px",
    },

    titleRow: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    h1: {
      margin: 0,
      fontSize: 40,
      letterSpacing: -0.8,
      lineHeight: 1.1,
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },

    count: { color: "rgba(15, 23, 42, 0.62)", fontSize: 14 },

    flavor: {
      margin: 0,
      color: "rgba(15, 23, 42, 0.72)",
      lineHeight: 1.7,
      maxWidth: 900,
      fontSize: 16,
    },

    progressWrap: {
      marginTop: 12,
      padding: "16px 18px",
      borderRadius: 18,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(249, 242, 230, 0.96))",
      boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    progressText: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },

    progressLabel: {
      fontSize: 12,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "rgba(120, 90, 60, 0.7)",
    },

    progressValue: {
      fontSize: 18,
      fontWeight: 700,
      color: "rgba(83, 46, 20, 0.92)",
    },

    progressPct: {
      fontSize: 14,
      fontWeight: 600,
      color: "rgba(120, 90, 60, 0.7)",
      marginLeft: 8,
    },

    barOuter: {
      height: 16,
      width: "min(520px, 100%)",
      borderRadius: 999,
      background:
        "linear-gradient(180deg, rgba(92, 62, 36, 0.16), rgba(92, 62, 36, 0.26))",
      overflow: "hidden",
      boxShadow: "inset 0 1px 3px rgba(15, 23, 42, 0.18)",
    },

    barInner: {
      height: "100%",
      borderRadius: 999,
      background:
        "linear-gradient(90deg, rgba(139, 88, 46, 0.95), rgba(207, 153, 95, 0.95))",
      width: `${pct}%`,
      boxShadow: "0 0 12px rgba(207, 153, 95, 0.35)",
    },

    error: {
      marginTop: 14,
      padding: 12,
      borderRadius: 14,
      border: "1px solid rgba(220, 38, 38, 0.18)",
      background: "rgba(255, 229, 229, 0.92)",
      color: "rgba(127, 29, 29, 0.92)",
      overflowX: "auto",
      fontSize: 12,
      lineHeight: 1.5,
    },

    cabinetOuter: {
      position: "relative",
      borderRadius: 28,
      padding: 26,
      border: "1px solid rgba(0,0,0,0.14)",
      background: "linear-gradient(180deg, rgba(118, 70, 40, 1), rgba(92, 54, 30, 1))",
      overflow: "hidden",
    },

    grainOverlay: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: 0.34,
      background:
        "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 2px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 7px)," +
        "repeating-linear-gradient(12deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 8px)",
    },

    mouldingBand: {
      position: "absolute",
      inset: 10,
      borderRadius: 22,
      border: "1px solid rgba(0,0,0,0.22)",
      pointerEvents: "none",
      background:
        "repeating-linear-gradient(90deg, rgba(255, 220, 160, 0.18) 0px, rgba(255, 220, 160, 0.18) 6px, rgba(0,0,0,0.10) 7px, rgba(0,0,0,0.10) 12px)," +
        "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.14))",
      opacity: 0.75,
    },

    inlayStripe: {
      position: "absolute",
      inset: 18,
      borderRadius: 18,
      border: "1px solid rgba(255, 226, 170, 0.55)",
      pointerEvents: "none",
    },

    cabinetInner: {
      position: "relative",
      borderRadius: 18,
      border: "1px solid rgba(0,0,0,0.20)",
      padding: "18px 16px 16px",
      background: "linear-gradient(180deg, rgba(206, 165, 120, 0.92), rgba(191, 147, 102, 0.92))",
    },

    innerTrim: {
      position: "absolute",
      inset: 10,
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.18)",
      pointerEvents: "none",
      opacity: 0.55,
    },

    cabinetTopRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    },

    cabinetTitle: {
      margin: 0,
      fontSize: 14,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "rgba(15, 23, 42, 0.58)",
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },

    plaque: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(15, 23, 42, 0.12)",
      background: "rgba(255,255,255,0.92)",
      fontSize: 13,
      color: "rgba(15, 23, 42, 0.78)",
    },

    rosette: {
      position: "absolute",
      width: 28,
      height: 28,
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.26)",
      background:
        "conic-gradient(from 0deg, rgba(255, 222, 170, 0.85), rgba(90, 48, 24, 0.25), rgba(255, 222, 170, 0.85))",
      pointerEvents: "none",
      opacity: 0.9,
    },

    rosetteCenter: {
      position: "absolute",
      inset: 7,
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.22)",
      background: "rgba(255, 226, 170, 0.55)",
    },

    shelfStage: {
      position: "relative",
      borderRadius: 14,
      padding: 14,
      border: "1px solid rgba(0,0,0,0.18)",
      background: "linear-gradient(180deg, rgba(178, 131, 88, 0.55), rgba(160, 115, 76, 0.55))",
      overflow: "hidden",
    },

    shelfLines: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: 0.78,
      background:
        "repeating-linear-gradient(" +
        "180deg," +
        "rgba(0,0,0,0.00) 0px," +
        "rgba(0,0,0,0.00) 132px," +
        "rgba(86, 52, 26, 0.35) 132px," +
        "rgba(86, 52, 26, 0.35) 140px," +
        "rgba(255, 226, 170, 0.18) 140px," +
        "rgba(255, 226, 170, 0.18) 146px" +
        ")",
    },

    shelfLip: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 14,
      pointerEvents: "none",
      background: "linear-gradient(180deg, rgba(0,0,0,0.00), rgba(86, 52, 26, 0.22))",
    },

    grid: {
      position: "relative",
      zIndex: 1,
      display: "grid",
      gap: 14,
      gridTemplateColumns: "repeat(8, 1fr)",
      gridAutoRows: 132,
      alignItems: "stretch",
    },

    slot: {
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.14)",
      background: "rgba(255,255,255,0.92)",
      padding: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      userSelect: "none",
    },

    imgWrap: {
      width: 84,
      height: 84,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255, 255, 255, 0.98)",
      borderRadius: 14,
      border: "1px solid rgba(15, 23, 42, 0.16)",
      padding: 8,
      boxSizing: "border-box",
    },

    label: {
      fontSize: 14,
      fontFamily: "system-ui",
      fontWeight: 600,
      textAlign: "center",
      lineHeight: 1.2,
      color: "rgba(15, 23, 42, 0.78)",
      maxWidth: 96,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    placeholder: {
      width: 64,
      height: 64,
      borderRadius: 10,
      border: "1px dashed rgba(15, 23, 42, 0.28)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      color: "rgba(15, 23, 42, 0.55)",
      background: "rgba(255,255,255,0.92)",
    },

    footer: { marginTop: 18, paddingLeft: 2 },
    link: { color: "inherit" },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.titleRow}>
            <h1 style={styles.h1}>Collection</h1>
            <div style={styles.count}>{loading ? "Loading…" : `${collectedCount} / ${totalCount} collected`}</div>
          </div>

          <p style={styles.flavor}>
            A record of what has been found so far. The cabinet does not forget.
          </p>

          <div style={styles.progressWrap}>
            <div style={styles.progressText}>
              <div style={styles.progressLabel}>Collection progress</div>
              <div style={styles.progressValue}>
                {collectedCount} / {totalCount} collected
                <span style={styles.progressPct}>({pct}%)</span>
              </div>
            </div>
            <div style={styles.barOuter} aria-hidden="true">
              <div style={styles.barInner} />
            </div>
          </div>

          {error ? <pre style={styles.error}>{error}</pre> : null}
        </header>

        <section style={styles.cabinetOuter} aria-label="Vitrine cabinet">
          <div style={styles.grainOverlay} aria-hidden="true" />
          <div style={styles.mouldingBand} aria-hidden="true" />
          <div style={styles.inlayStripe} aria-hidden="true" />

          <div style={{ ...styles.rosette, top: 14, left: 14 }} aria-hidden="true">
            <div style={styles.rosetteCenter} />
          </div>
          <div style={{ ...styles.rosette, top: 14, right: 14 }} aria-hidden="true">
            <div style={styles.rosetteCenter} />
          </div>
          <div style={{ ...styles.rosette, bottom: 14, left: 14 }} aria-hidden="true">
            <div style={styles.rosetteCenter} />
          </div>
          <div style={{ ...styles.rosette, bottom: 14, right: 14 }} aria-hidden="true">
            <div style={styles.rosetteCenter} />
          </div>

          <div style={styles.cabinetInner}>
            <div style={styles.innerTrim} aria-hidden="true" />

            <div style={styles.cabinetTopRow}>
              <p style={styles.cabinetTitle}>Display Shelf</p>

              <div style={styles.plaque}>
                <span style={{ opacity: 0.7 }}>Progress</span>
                <strong style={{ fontWeight: 800 }}>{pct}%</strong>
              </div>
            </div>

            <div style={styles.shelfStage}>
              <div style={styles.shelfLines} aria-hidden="true" />
              <div style={styles.shelfLip} aria-hidden="true" />

              <div style={styles.grid}>
                {items.map((item, idx) => {
                  const isCollected = collected.has(item.id);

                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.slot,
                        background: isCollected ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.90)",
                      }}
                      title={item.name}
                    >
                      <div style={styles.imgWrap}>
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={64}
                            height={64}
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: "contain",
                              filter: isCollected ? "none" : "grayscale(100%)",
                              opacity: isCollected ? 1 : 0.26,
                            }}
                          />
                        ) : (
                          <div style={styles.placeholder}>{`#${idx + 1}`}</div>
                        )}
                      </div>

                      <div style={{ ...styles.label, opacity: isCollected ? 1 : 0.55 }}>{item.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          
        </footer>
      </div>
    </main>
  );
}
