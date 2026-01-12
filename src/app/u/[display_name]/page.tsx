"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { restFetch } from "@/lib/supabaseRest";

type Item = {
  id: string;
  name: string;
  image_url: string | null;
};

type Achievement = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  featured_item_ids: string[] | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ display_name: string }>();
  const displayNameParam =
    typeof params?.display_name === "string" ? decodeURIComponent(params.display_name).trim() : "";
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hoveredAchievementId, setHoveredAchievementId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!displayNameParam) return;
    (async () => {
      try {
        setLoading(true);
        const displayName = displayNameParam;
        const profileRes = await restFetch<(ProfileRow & { username?: string | null })[]>("profiles", {
          select: "id,display_name,bio,featured_item_ids,username",
          display_name: `ilike.*${displayName}*`,
          limit: "1",
        });
        let profileRow = (profileRes?.[0] ?? null) as (ProfileRow & { username?: string | null }) | null;

        if (!profileRow) {
          const fallbackRes = await restFetch<(ProfileRow & { username?: string | null })[]>("profiles", {
            select: "id,display_name,bio,featured_item_ids,username",
            username: `ilike.*${displayName}*`,
            limit: "1",
          });
          profileRow = (fallbackRes?.[0] ?? null) as (ProfileRow & { username?: string | null }) | null;
        }

        if (!profileRow) {
          setError("Profile not found.");
          return;
        }
        setProfile(profileRow);

        const featured = profileRow.featured_item_ids ?? [];
        if (featured.length === 0) {
          setItems([]);
          return;
        }

        const itemsRes = await restFetch<Item[]>("items", {
          select: "id,name,image_url",
          id: `in.(${featured.join(",")})`,
        });
        const byId = new Map((itemsRes ?? []).map((item) => [item.id, item]));
        setItems(featured.map((id) => byId.get(id)).filter(Boolean) as Item[]);

        const achievementsRes = await restFetch<{ achievements: Achievement | null }[]>("user_achievements", {
          select: "achievements(id,name,description,icon_url)",
          user_id: `eq.${profileRow.id}`,
        });
        const achievementRows = (achievementsRes ?? []).map((row) => row.achievements).filter(Boolean);
        setAchievements(achievementRows as Achievement[]);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [displayNameParam]);

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
      maxWidth: 1000,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18,
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
      color: "rgba(15, 23, 42, 0.7)",
      lineHeight: 1.7,
      maxWidth: 720,
    },
    cabinetOuter: {
      position: "relative",
      borderRadius: 26,
      padding: 18,
      border: "1px solid rgba(99, 57, 24, 0.45)",
      background: "linear-gradient(180deg, rgba(145, 98, 62, 0.95), rgba(111, 69, 37, 0.95))",
    },
    grainOverlay: {
      position: "absolute",
      inset: 0,
      borderRadius: 26,
      pointerEvents: "none",
      opacity: 0.45,
      background:
        "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 7px)," +
        "repeating-linear-gradient(12deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 8px)",
    },
    cabinetInner: {
      position: "relative",
      borderRadius: 20,
      border: "1px solid rgba(0,0,0,0.2)",
      padding: "18px 16px 16px",
      background: "linear-gradient(180deg, rgba(206, 165, 120, 0.95), rgba(191, 147, 102, 0.95))",
    },
    innerTrim: {
      position: "absolute",
      inset: 10,
      borderRadius: 16,
      border: "1px solid rgba(0,0,0,0.16)",
      pointerEvents: "none",
      opacity: 0.55,
    },
    cabinetTopRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
      flexWrap: "wrap",
    },
    cabinetTitle: {
      margin: 0,
      fontSize: 13,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "rgba(15, 23, 42, 0.6)",
      fontFamily: "system-ui",
    },
    plaque: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      borderRadius: 14,
      border: "1px solid rgba(15, 23, 42, 0.12)",
      background: "rgba(255,255,255,0.92)",
      fontSize: 12,
      color: "rgba(15, 23, 42, 0.78)",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    shelfStage: {
      borderRadius: 14,
      padding: 14,
      border: "1px solid rgba(0,0,0,0.18)",
      background: "linear-gradient(180deg, rgba(178, 131, 88, 0.55), rgba(160, 115, 76, 0.55))",
    },
    rosette: {
      position: "absolute",
      width: 24,
      height: 24,
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.26)",
      background:
        "conic-gradient(from 0deg, rgba(255, 222, 170, 0.85), rgba(90, 48, 24, 0.25), rgba(255, 222, 170, 0.85))",
      pointerEvents: "none",
      opacity: 0.9,
    },
    rosetteCenter: {
      position: "absolute",
      inset: 6,
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.22)",
      background: "rgba(255, 226, 170, 0.55)",
    },
    grid: {
      display: "grid",
      gap: 14,
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 150px))",
      gridAutoRows: 150,
      justifyContent: "center",
      justifyItems: "center",
    },
    slot: {
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.14)",
      background: "rgba(255,255,255,0.94)",
      padding: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      userSelect: "none",
    },
    imgWrap: {
      width: 100,
      height: 100,
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
      fontWeight: 600,
      textAlign: "center",
      color: "rgba(15, 23, 42, 0.78)",
      lineHeight: 1.2,
    },
    trophyOuter: {
      position: "relative",
      borderRadius: 22,
      border: "1px solid rgba(152, 111, 38, 0.4)",
      background: "linear-gradient(180deg, rgba(255, 239, 202, 0.92), rgba(222, 186, 114, 0.94))",
      padding: 18,
    },
    trophyInner: {
      borderRadius: 18,
      border: "1px solid rgba(144, 104, 34, 0.45)",
      background: "rgba(255, 248, 224, 0.96)",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    trophyHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    },
    trophyTitle: {
      margin: 0,
      fontSize: 13,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "rgba(92, 60, 20, 0.8)",
      fontFamily: "system-ui",
    },
    trophyGrid: {
      display: "grid",
      gap: 12,
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    },
    trophyCard: {
      borderRadius: 14,
      border: "1px solid rgba(152, 111, 38, 0.3)",
      background: "rgba(255,255,255,0.95)",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "center",
      textAlign: "center",
      position: "relative",
    },
    trophyIcon: {
      width: 100,
      height: 100,
      borderRadius: 12,
      border: "1px solid rgba(152, 111, 38, 0.25)",
      background: "rgba(255,255,255,0.98)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      boxSizing: "border-box",
    },
    trophyName: {
      fontSize: 13,
      fontWeight: 600,
      color: "rgba(62, 38, 16, 0.9)",
    },
    trophyDesc: {
      fontSize: 12,
      color: "rgba(92, 60, 20, 0.7)",
      lineHeight: 1.4,
    },
    trophyTooltip: {
      position: "absolute",
      left: "50%",
      bottom: "calc(100% + 10px)",
      transform: "translateX(-50%)",
      minWidth: 160,
      maxWidth: 220,
      padding: "8px 10px",
      borderRadius: 10,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 248, 236, 0.98)",
      color: "rgba(72, 42, 18, 0.9)",
      fontSize: 12,
      lineHeight: 1.4,
      textAlign: "center",
      zIndex: 5,
      pointerEvents: "none",
    },
    trophyTooltipArrow: {
      position: "absolute",
      left: "50%",
      bottom: -6,
      width: 10,
      height: 10,
      background: "rgba(255, 248, 236, 0.98)",
      borderLeft: "1px solid rgba(120, 90, 60, 0.35)",
      borderBottom: "1px solid rgba(120, 90, 60, 0.35)",
      transform: "translateX(-50%) rotate(45deg)",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {loading ? <div>Loading…</div> : null}
        {error ? <pre style={{ margin: 0 }}>{error}</pre> : null}
        {profile ? (
          <>
            <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h1 style={styles.title}>{profile.display_name ?? "Collector"}</h1>
              {profile.bio ? <p style={styles.subtitle}>{profile.bio}</p> : null}
            </header>

            <section style={styles.cabinetOuter}>
              <div style={styles.grainOverlay} aria-hidden="true" />
              <div style={{ ...styles.rosette, top: 12, left: 12 }} aria-hidden="true">
                <div style={styles.rosetteCenter} />
              </div>
              <div style={{ ...styles.rosette, top: 12, right: 12 }} aria-hidden="true">
                <div style={styles.rosetteCenter} />
              </div>
              <div style={{ ...styles.rosette, bottom: 12, left: 12 }} aria-hidden="true">
                <div style={styles.rosetteCenter} />
              </div>
              <div style={{ ...styles.rosette, bottom: 12, right: 12 }} aria-hidden="true">
                <div style={styles.rosetteCenter} />
              </div>
              <div style={styles.cabinetInner}>
                <div style={styles.innerTrim} aria-hidden="true" />
                <div style={styles.cabinetTopRow}>
                  <p style={styles.cabinetTitle}>
                    {(profile.display_name ?? "Collector") + "'s Vitrine"}
                  </p>
                  <div style={styles.plaque}>Featured items</div>
                </div>

                <div style={styles.shelfStage}>
                  {items.length === 0 ? (
                    <div style={{ color: "rgba(15, 23, 42, 0.6)" }}>No featured items yet.</div>
                  ) : (
                    <div style={styles.grid}>
                      {items.map((item) => (
                        <div key={item.id} style={styles.slot}>
                          <div style={styles.imgWrap}>
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                width={100}
                                height={100}
                                style={{ width: 100, height: 100, objectFit: "contain" }}
                              />
                            ) : null}
                          </div>
                          <div style={styles.label}>{item.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section style={styles.trophyOuter}>
              <div style={styles.trophyInner}>
                <div style={styles.trophyHeader}>
                  <p style={styles.trophyTitle}>Trophy Case</p>
                  <span style={{ fontSize: 12, color: "rgba(92, 60, 20, 0.7)" }}>
                    {achievements.length} earned
                  </span>
                </div>
                {achievements.length === 0 ? (
                  <div style={{ color: "rgba(92, 60, 20, 0.6)" }}>No achievements earned yet.</div>
                ) : (
                  <div style={styles.trophyGrid}>
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        style={styles.trophyCard}
                        onMouseEnter={() => setHoveredAchievementId(achievement.id)}
                        onMouseLeave={() => setHoveredAchievementId(null)}
                      >
                        {achievement.description && hoveredAchievementId === achievement.id ? (
                          <div style={styles.trophyTooltip}>
                            {achievement.description}
                            <span style={styles.trophyTooltipArrow} />
                          </div>
                        ) : null}
                        <div style={styles.trophyIcon}>
                          {achievement.icon_url ? (
                            <Image
                              src={achievement.icon_url}
                              alt={achievement.name}
                              width={100}
                              height={100}
                              style={{ width: 100, height: 100, objectFit: "contain" }}
                            />
                          ) : null}
                        </div>
                        <div style={styles.trophyName}>{achievement.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
