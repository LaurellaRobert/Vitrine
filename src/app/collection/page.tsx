"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  name: string;
  sort_order: number | null;
  rarity: number | null;
  image_url: string | null;
  description: string | null;
  collection_id: string | null;
};

type CollectedRow = {
  item_id: string;
};

export default function CollectionPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [raritySort, setRaritySort] = useState<"asc" | "desc">("asc");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    const base =
      !selectedCollectionId || selectedCollectionId === "all"
        ? allItems
        : allItems.filter((item) => item.collection_id === selectedCollectionId);
    return [...base].sort((a, b) => {
      const aVal = a.rarity ?? 0;
      const bVal = b.rarity ?? 0;
      return raritySort === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [allItems, selectedCollectionId, raritySort]);

  const collectedCount = filteredItems.filter((item) => collected.has(item.id)).length;
  const totalCount = filteredItems.length;

  const pct = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((collectedCount / totalCount) * 100);
  }, [collectedCount, totalCount]);

  useEffect(() => {
    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let authTimer: ReturnType<typeof setTimeout> | null = null;
    let authSub: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null;
    const cacheKey = "vitrine.collection.cache";
    const cacheUserKey = "vitrine.collection.cacheUser";

    const fetchAll = async (attempt: number) => {
      if (!mounted) return;
      setLoading(true);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user?.id ?? null;

        const itemsRes = await supabase
          .from("items")
          .select("id,name,sort_order,rarity,image_url,description,collection_id")
          .order("rarity", { ascending: true, nullsFirst: false })
          .order("sort_order", { ascending: true, nullsFirst: false });

        if (itemsRes.error) throw itemsRes.error;

        const collectedRes = await supabase.from("user_collected_items").select("item_id");
        if (collectedRes.error) throw collectedRes.error;

        const itemsData = (itemsRes.data ?? []) as Item[];
        if (itemsData.length === 0 && attempt < 2) {
          const delayMs = attempt === 0 ? 1200 : 2000;
          retryTimer = setTimeout(() => {
            fetchAll(attempt + 1).catch((err) => {
              if (mounted) setError(err?.message ?? "Unknown error");
            });
          }, delayMs);
          return;
        }

        setAllItems(itemsData);
        const collectionIds = Array.from(
          new Set(
            itemsData
              .map((item) => item.collection_id)
              .filter((id): id is string => !!id)
          )
        );
        let optionsToCache: { id: string; name: string }[] | undefined;
        let selectedToCache: string | null = selectedCollectionId ?? null;

        if (collectionIds.length > 0) {
          const collectionsRes = await supabase
            .from("collections")
            .select("id,collection_display_name")
            .in("id", collectionIds);
          const fetched = (collectionsRes.data ?? []).map((row) => ({
            id: row.id as string,
            name: (row.collection_display_name as string) ?? row.id,
          }));
          const fallback = collectionIds.map((id) => ({ id, name: id }));
          const merged = fetched.length > 0 ? fetched : fallback;
          const options = [...merged, { id: "all", name: "All collections" }];
          optionsToCache = options;
          setCollectionOptions(options);
          if (!selectedCollectionId) {
            const foodOption = options.find((option) => option.name === "Food");
            const nextSelected = foodOption?.id ?? options[0]?.id ?? "all";
            setSelectedCollectionId(nextSelected);
            selectedToCache = nextSelected;
          }
        }
        setCollected(new Set<string>((collectedRes.data ?? []).map((r: CollectedRow) => r.item_id)));
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              items: itemsData,
              collected: (collectedRes.data ?? []).map((r: CollectedRow) => r.item_id),
              options: optionsToCache,
              selected: selectedToCache,
            })
          );
          if (currentUserId) {
            sessionStorage.setItem(cacheUserKey, currentUserId);
          }
        } catch {
          // Ignore cache write failures (private mode, storage limits).
        }
        setLoading(false);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? "Unknown error");
          setLoading(false);
        }
      }
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForSession = async (refreshFirst: boolean) => {
      if (refreshFirst) {
        await supabase.auth.refreshSession();
      }

      for (let i = 0; i < 4; i += 1) {
        if (!mounted) return false;
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          return true;
        }
        await delay(250);
      }

      return false;
    };

    const fetchIfAuthed = async (showAuthError: boolean, refreshFirst = false) => {
      const hasSession = await waitForSession(refreshFirst);
      if (hasSession) {
        fetchAll(0).catch((err) => setError(err?.message ?? "Unknown error"));
        return;
      }

      if (showAuthError) {
        setLoading(true);
        authTimer = setTimeout(() => {
          if (mounted) {
            setError("Not signed in. Go to /login");
            setLoading(false);
          }
        }, 1500);
      }
    };

    const start = async () => {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedUser = sessionStorage.getItem(cacheUserKey);
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUserId = sessionData.session?.user?.id ?? null;
          if (!cachedUser || !currentUserId || cachedUser === currentUserId) {
            const parsed = JSON.parse(cached) as {
              items?: Item[];
              collected?: string[];
              options?: { id: string; name: string }[];
              selected?: string | null;
            };
            if (parsed.items && parsed.items.length > 0) {
              setAllItems(parsed.items);
              setCollected(new Set<string>(parsed.collected ?? []));
              if (parsed.options && parsed.options.length > 0) {
                setCollectionOptions(parsed.options);
              }
              if (parsed.selected) {
                setSelectedCollectionId(parsed.selected);
              }
              setLoading(false);
            }
          }
        }
      } catch {
        // Ignore cache read failures.
      }

      await fetchIfAuthed(true);

      authSub = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
          if (authTimer) clearTimeout(authTimer);
          fetchAll(0).catch((err) => setError(err?.message ?? "Unknown error"));
        }
      });
    };

    const handleFocus = () => {
      fetchIfAuthed(false, true).catch((err) => setError(err?.message ?? "Unknown error"));
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchIfAuthed(false, true).catch((err) => setError(err?.message ?? "Unknown error"));
      }
    };

    start().catch((err) => setError(err?.message ?? "Unknown error"));
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (authTimer) clearTimeout(authTimer);
      if (authSub) authSub.data.subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
    filterRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
      marginTop: 6,
    },
    filterSpacer: {
      flex: 1,
      minWidth: 20,
    },
    sortRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
      marginTop: 6,
    },
    sortLabel: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: "rgba(120, 90, 60, 0.7)",
    },
    pill: {
      padding: "8px 14px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 248, 236, 1)",
      color: "rgba(72, 42, 18, 0.92)",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 600,
    },
    pillActive: {
      border: "1px solid rgba(156, 108, 62, 0.7)",
      background: "rgba(255, 235, 206, 1)",
      boxShadow: "0 6px 14px rgba(120, 90, 60, 0.18)",
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
      overflow: "visible",
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
      overflow: "visible",
    },

    shelfLines: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: 0.78,
      background: "transparent",
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
      gridAutoRows: 150,
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
      position: "relative",
    },
    tooltip: {
      position: "absolute",
      left: "50%",
      bottom: "calc(100% + 10px)",
      transform: "translateX(-50%)",
      minWidth: 160,
      maxWidth: 200,
      padding: "8px 10px",
      borderRadius: 10,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 248, 236, 0.98)",
      color: "rgba(72, 42, 18, 0.9)",
      fontSize: 12,
      lineHeight: 1.4,
      textAlign: "center",
      boxShadow: "0 10px 20px rgba(52, 30, 14, 0.15)",
      zIndex: 5,
      pointerEvents: "none",
    },
    tooltipArrow: {
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
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
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

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(30, 24, 18, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 40,
    },
    modalCard: {
      width: "min(640px, 92vw)",
      maxHeight: "90vh",
      borderRadius: 22,
      border: "1px solid rgba(110, 72, 38, 0.5)",
      background: "rgba(208, 166, 122, 0.98)",
      backgroundImage:
        "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, rgba(86, 52, 24, 0.18) 3px, rgba(86, 52, 24, 0.18) 7px)," +
        "radial-gradient(circle at 18% 15%, rgba(255, 222, 178, 0.45), transparent 45%)," +
        "radial-gradient(circle at 85% 20%, rgba(255, 235, 200, 0.35), transparent 55%)",
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      overflowY: "auto",
    },
    modalHeader: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    },
    modalCloseRow: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
    },
    modalTitle: {
      margin: 0,
      fontSize: 30,
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
      color: "rgba(35, 22, 12, 0.92)",
      textAlign: "center",
    },
    modalTitlePlaque: {
      alignSelf: "center",
      width: "min(420px, 90%)",
      padding: "10px 20px",
      borderRadius: 999,
      border: "1px solid rgba(184, 135, 46, 0.7)",
      background:
        "radial-gradient(circle at 20% 30%, rgb(255, 246, 220), rgb(224, 170, 64) 55%)," +
        "linear-gradient(160deg, rgb(252, 226, 170), rgb(198, 146, 50))",
      color: "rgba(78, 52, 20, 0.95)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 0 rgba(132, 84, 18, 0.6)",
      position: "relative",
      textAlign: "center",
    },
    modalTitlePlaqueTrim: {
      position: "absolute",
      inset: 3,
      borderRadius: 999,
      border: "1px solid rgba(164, 112, 30, 0.65)",
      boxShadow:
        "inset 0 0 0 1px rgba(255, 248, 220, 0.45), inset 0 -1px 0 rgba(114, 72, 20, 0.35)",
      pointerEvents: "none",
    },
    modalTitlePlaqueOrnament: {
      position: "absolute",
      top: "50%",
      width: 10,
      height: 10,
      borderRadius: 999,
      border: "1px solid rgba(164, 112, 30, 0.75)",
      background:
        "radial-gradient(circle at 30% 30%, rgb(255, 245, 212), rgb(190, 132, 40))",
      transform: "translateY(-50%)",
      pointerEvents: "none",
    },
    modalClose: {
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255,255,255,0.9)",
      borderRadius: 999,
      width: 28,
      height: 28,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      cursor: "pointer",
      fontWeight: 600,
      color: "rgba(78, 54, 30, 0.9)",
    },
    modalImageWrap: {
      borderRadius: 18,
      border: "1px solid rgba(120, 90, 60, 0.28)",
      background: "rgba(246, 236, 222, 0.98)",
      backgroundImage:
        "repeating-linear-gradient(120deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 3px, rgba(112, 76, 44, 0.04) 4px, rgba(112, 76, 44, 0.04) 9px)",
      padding: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },
    modalFrame: {
      position: "absolute",
      inset: 10,
      borderRadius: 14,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 255, 255, 0.55)",
      pointerEvents: "none",
    },
    modalImageMat: {
      borderRadius: 14,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255, 255, 255, 0.95)",
      padding: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 1,
      width: "min(320px, 80vw)",
      maxHeight: "min(320px, 60vh)",
      boxSizing: "border-box",
    },
    modalTag: {
      alignSelf: "flex-start",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 250, 242, 0.95)",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontSize: 11,
      color: "rgba(78, 54, 30, 0.8)",
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
    },
    modalTagRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    modalDesc: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.7,
      color: "rgba(35, 22, 12, 0.72)",
    },
    modalDescPill: {
      borderRadius: 14,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255, 252, 247, 0.98)",
      padding: "12px 14px",
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

          <div style={styles.filterRow}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(120, 90, 60, 0.7)" }}>
              Collection
            </div>
            {collectionOptions.map((option) => {
              const isActive = option.id === selectedCollectionId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedCollectionId(option.id)}
                  style={{ ...styles.pill, ...(isActive ? styles.pillActive : null) }}
                >
                  {option.name}
                </button>
              );
            })}
            <div style={styles.filterSpacer} aria-hidden="true" />
            <div style={styles.sortLabel}>SORT BY RARITY</div>
            <button
              type="button"
              onClick={() => setRaritySort("asc")}
              style={{ ...styles.pill, ...(raritySort === "asc" ? styles.pillActive : null) }}
            >
              Ascending
            </button>
            <button
              type="button"
              onClick={() => setRaritySort("desc")}
              style={{ ...styles.pill, ...(raritySort === "desc" ? styles.pillActive : null) }}
            >
              Descending
            </button>
          </div>

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
                {filteredItems.map((item, idx) => {
                  const isCollected = collected.has(item.id);
                  const isHovered = hoveredItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.slot,
                        background: isCollected ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.90)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      onClick={() => setSelectedItem(item)}
                      title={item.name}
                    >
                      {isHovered && item.description ? (
                        <div style={styles.tooltip}>
                          {item.description}
                          <span style={styles.tooltipArrow} />
                        </div>
                      ) : null}
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

      {selectedItem ? (
        <div style={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalCloseRow}>
                <button type="button" style={styles.modalClose} onClick={() => setSelectedItem(null)}>
                  ×
                </button>
              </div>
            </div>
            <div style={styles.modalImageWrap}>
              <div style={styles.modalFrame} aria-hidden="true" />
              <div style={styles.modalImageMat}>
                {selectedItem.image_url ? (
                  <Image
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    width={500}
                    height={500}
                    style={{
                      maxWidth: 300,
                      maxHeight: 300,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      filter: collected.has(selectedItem.id) ? "none" : "grayscale(100%)",
                      opacity: collected.has(selectedItem.id) ? 1 : 0.26,
                    }}
                  />
                ) : (
                  <div style={styles.placeholder}>No image</div>
                )}
              </div>
            </div>
            <div style={styles.modalTitlePlaque}>
              <div style={styles.modalTitlePlaqueTrim} aria-hidden="true" />
              <div style={{ ...styles.modalTitlePlaqueOrnament, left: 12 }} aria-hidden="true" />
              <div style={{ ...styles.modalTitlePlaqueOrnament, right: 12 }} aria-hidden="true" />
              <h2 style={styles.modalTitle}>{selectedItem.name}</h2>
            </div>
            <div style={styles.modalTagRow}>
              <div style={styles.modalTag}>
                {collectionOptions.find((option) => option.id === selectedItem.collection_id)?.name ?? "Unsorted"}
              </div>
              <div style={styles.modalTag}>Rarity: {selectedItem.rarity ?? 0}</div>
            </div>
            <div style={styles.modalDescPill}>
              <p style={styles.modalDesc}>
                {selectedItem.description ? selectedItem.description : "No flavor text yet."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
