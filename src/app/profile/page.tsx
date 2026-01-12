"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

type Item = {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number | null;
};

type ProfileRow = {
  display_name: string | null;
  bio: string | null;
  featured_item_ids: string[] | null;
};

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        const token = getAccessToken();
        if (!userId || !token) {
          setStatus("You need to sign in to edit your profile.");
          return;
        }

        setUserId(userId);

        const profileRes = await restFetch<ProfileRow[]>(
          "profiles",
          {
            select: "display_name,bio,featured_item_ids",
            id: `eq.${userId}`,
            limit: "1",
          },
          { token }
        );
        const profile = (profileRes?.[0] ?? null) as ProfileRow | null;
        setDisplayName(profile?.display_name ?? "");
        setBio(profile?.bio ?? "");
        setFeaturedIds(profile?.featured_item_ids ?? []);

        const collectedRes = await restFetch<{ item_id: string }[]>(
          "user_collected_items",
          { select: "item_id", user_id: `eq.${userId}` },
          { token }
        );
        const itemIds = (collectedRes ?? []).map((row) => row.item_id).filter(Boolean);
        if (itemIds.length === 0) {
          setItems([]);
          return;
        }

        const itemsRes = await restFetch<Item[]>(
          "items",
          { select: "id,name,image_url,sort_order", id: `in.(${itemIds.join(",")})`, order: "sort_order.asc" },
          { token }
        );
        setItems((itemsRes ?? []) as Item[]);
      } catch (e: any) {
        setStatus(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredSet = useMemo(() => new Set(featuredIds), [featuredIds]);

  function toggleFeatured(id: string) {
    setFeaturedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  async function saveProfile() {
    if (!userId) return;
    if (!displayName.trim()) {
      setStatus("Display name is required.");
      return;
    }
    setStatus("Saving...");
    const token = getAccessToken();
    if (!token) {
      setStatus("You need to sign in to edit your profile.");
      return;
    }
    try {
      await restFetch(
        "profiles",
        { on_conflict: "id" },
        {
          method: "POST",
          token,
          prefer: "resolution=merge-duplicates,return=minimal",
          body: {
            id: userId,
            display_name: displayName.trim() || null,
            username: displayName.trim(),
            bio: bio.trim() || null,
            featured_item_ids: featuredIds,
          },
        }
      );
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to save.");
      return;
    }

    setStatus("Saved.");
  }

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
      maxWidth: 1100,
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
    section: {
      borderRadius: 18,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.92)",
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: 12,
    },
    card: {
      borderRadius: 14,
      border: "1px solid rgba(15, 23, 42, 0.12)",
      background: "rgba(255,255,255,0.94)",
      padding: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    },
    imgWrap: {
      width: 72,
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255, 255, 255, 0.98)",
      borderRadius: 12,
      border: "1px solid rgba(15, 23, 42, 0.16)",
      padding: 6,
      boxSizing: "border-box",
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      textAlign: "center",
      color: "rgba(15, 23, 42, 0.78)",
    },
  };

  if (!userId && !loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <h1 style={styles.title}>Profile</h1>
          <div style={styles.section}>
            <p style={{ margin: 0 }}>{status}</p>
            <Link href="/login">Go to login</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={styles.title}>Your Profile</h1>
          <p style={{ margin: 0, color: "rgba(15, 23, 42, 0.7)" }}>
            Add a short bio and choose up to three items to show on your public page.
          </p>
        </header>

        <section style={styles.section}>
          <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(15, 23, 42, 0.12)" }}
            placeholder="Your name"
          />

          <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(15, 23, 42, 0.12)" }}
            placeholder="Say a little about yourself"
          />

          <button
            type="button"
            onClick={saveProfile}
            style={{
              alignSelf: "flex-start",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(120, 90, 60, 0.4)",
              background: "rgba(255, 235, 206, 1)",
              cursor: "pointer",
            }}
          >
            Save profile
          </button>
          {status ? <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.7)" }}>{status}</div> : null}
        </section>

        <section style={styles.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Featured items
            </div>
            <div style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.6)" }}>
              {featuredIds.length}/5 selected
            </div>
          </div>

          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(15, 23, 42, 0.6)" }}>
              No items collected yet.
            </div>
          ) : (
            <div style={styles.grid}>
              {items.map((item) => {
                const isSelected = featuredSet.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFeatured(item.id)}
                    style={{
                      ...styles.card,
                      border: isSelected
                        ? "1px solid rgba(156, 108, 62, 0.7)"
                        : "1px solid rgba(15, 23, 42, 0.12)",
                    }}
                  >
                    <div style={styles.imgWrap}>
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={64}
                          height={64}
                          style={{ width: 64, height: 64, objectFit: "contain" }}
                        />
                      ) : null}
                    </div>
                    <div style={styles.label}>{item.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
