"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { notifyCurrency } from "@/lib/currency";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

type VendorItem = {
  id: string;
  price: number;
  item: {
    id: string;
    name: string;
    image_url: string | null;
    description: string | null;
  } | null;
};

export default function InnVendorPage() {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const rareItemId = "67c1d00c-ad72-49a9-a338-03aa631dd9e3";
  const rarePrice = 100;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const itemsRes = await restFetch<VendorItem[]>("vendor_items", {
          select: "id,price,item:items(id,name,image_url,description)",
          vendor_key: "eq.inn",
          is_active: "eq.true",
          item_id: `neq.${rareItemId}`,
          order: "price.asc",
        });
        let nextItems = (itemsRes ?? []) as VendorItem[];

        if (Math.random() < 0.01) {
          const rareVendorRows = await restFetch<VendorItem[]>("vendor_items", {
            select: "id,price,item:items(id,name,image_url,description)",
            vendor_key: "eq.inn",
            item_id: `eq.${rareItemId}`,
            is_active: "eq.true",
            limit: "1",
          });
          const rareVendorItem = (rareVendorRows ?? [])[0];
          if (rareVendorItem?.item && !nextItems.some((entry) => entry.item?.id === rareItemId)) {
            nextItems = [
              ...nextItems,
              {
                ...rareVendorItem,
                price: rareVendorItem.price ?? rarePrice,
              },
            ];
          }
        }

        setItems(nextItems);

        const userId = getUserId();
        const token = getAccessToken();
        if (userId && token) {
          const itemIds = nextItems
            .map((entry) => entry.item?.id)
            .filter((id): id is string => Boolean(id));
          if (itemIds.length > 0) {
            const ownedRes = await restFetch<{ item_id: string }[]>(
              "user_collected_items",
              { select: "item_id", item_id: `in.(${itemIds.join(",")})`, user_id: `eq.${userId}` },
              { token }
            );
            setOwnedItemIds((ownedRes ?? []).map((row) => row.item_id));
          } else {
            setOwnedItemIds([]);
          }
          const currencyRes = await restFetch<{ balance: number }[]>(
            "user_currency",
            { select: "balance", user_id: `eq.${userId}`, limit: "1" },
            { token }
          );
          setBalance(currencyRes?.[0]?.balance ?? 0);
        } else {
          setBalance(null);
          setOwnedItemIds([]);
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePurchase = async (vendorItemId: string) => {
    try {
      setPurchasingId(vendorItemId);
      setStatus("");
      const token = getAccessToken();
      if (!token) {
        setStatus("Sign in to purchase.");
        return;
      }

      const rpc = await restFetch<any>(
        "rpc/purchase_vendor_item",
        {},
        { method: "POST", body: { p_vendor_item_id: vendorItemId }, token }
      );
      const row = Array.isArray(rpc) ? rpc[0] : rpc;
      const nextBalance = (row as any)?.new_balance ?? null;
      if (typeof nextBalance === "number") {
        setBalance(nextBalance);
        notifyCurrency(nextBalance);
      }
      const purchasedItemId = items.find((entry) => entry.id === vendorItemId)?.item?.id;
      if (purchasedItemId) {
        setOwnedItemIds((prev) => (prev.includes(purchasedItemId) ? prev : [...prev, purchasedItemId]));
      }
      setStatus("Purchase complete.");
    } catch (e: any) {
      setStatus(e?.message ?? "Purchase failed.");
    } finally {
      setPurchasingId(null);
    }
  };

  const stockedItems = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((entry) => {
      if (!entry.item) return false;
      if (seen.has(entry.item.id)) return false;
      seen.add(entry.item.id);
      return true;
    });
  }, [items]);
  const ownedSet = useMemo(() => new Set(ownedItemIds), [ownedItemIds]);
  const featuredItems = useMemo(() => stockedItems.slice(0, 4), [stockedItems]);
  const gridItems = useMemo(() => stockedItems.slice(4), [stockedItems]);

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
      maxWidth: 1100,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      alignItems: "start",
    },
    heading: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
    },
    eyebrow: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "rgba(120, 90, 60, 0.7)",
      fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
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
      maxWidth: 420,
    },
    keeperWrap: {
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      width: "100%",
    },
    keeperImage: {
      borderRadius: 20,
      border: "1px solid rgba(120, 90, 60, 0.2)",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 700,
      color: "rgba(83, 46, 20, 0.8)",
    },
    keeperText: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      color: "rgba(15, 23, 42, 0.7)",
      fontSize: 14,
      lineHeight: 1.4,
      textAlign: "center",
    },
    cabinetOuter: {
      position: "relative",
      padding: 0,
    },
    grainOverlay: {
      display: "none",
    },
    cabinetInner: {
      position: "relative",
      padding: 0,
      background: "transparent",
      border: "none",
    },
    cabinetTop: {
      display: "none",
    },
    cabinetTitle: {
      margin: 0,
      fontSize: 13,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "rgba(15, 23, 42, 0.6)",
    },
    plaque: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 14,
      border: "1px solid rgba(15, 23, 42, 0.12)",
      background: "rgba(255,255,255,0.92)",
      fontSize: 12,
      color: "rgba(15, 23, 42, 0.78)",
    },
    shelfStage: {
      padding: 0,
      border: "none",
      background: "transparent",
    },
    grid: {
      display: "grid",
      gap: 14,
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    },
    row: {
      display: "flex",
      gap: 18,
      alignItems: "flex-start",
      overflowX: "auto",
      paddingBottom: 6,
    },
    card: {
      padding: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      textAlign: "center",
    },
    imgWrap: {
      width: 120,
      height: 120,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontSize: 14,
      fontWeight: 600,
      color: "rgba(15, 23, 42, 0.85)",
    },
    desc: {
      fontSize: 12,
      color: "rgba(15, 23, 42, 0.65)",
      lineHeight: 1.4,
    },
    price: {
      fontSize: 13,
      fontWeight: 700,
      color: "rgba(83, 46, 20, 0.9)",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.3)",
      background: "rgba(255, 244, 226, 0.95)",
    },
    buyButton: {
      padding: "6px 12px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 236, 210, 1)",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
    },
    buyButtonOwned: {
      border: "1px solid rgba(120, 120, 120, 0.4)",
      background: "rgba(224, 224, 224, 0.95)",
      color: "rgba(70, 70, 70, 0.75)",
    },
    buyButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.heading}>
          <h1 style={{ ...styles.title, textAlign: "center" }}>The Hearth & Ladle</h1>
          <div style={styles.keeperWrap}>
            <div style={styles.keeperImage}>
              <Image
                src="https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/shopkeepers/vitrine_shopkeepers.png"
                alt="Innkeeper"
                width={300}
                height={300}
                style={{ width: 300, height: 300, objectFit: "contain" }}
              />
            </div>
            <div style={styles.keeperText}>
              <strong style={{ color: "rgba(83, 46, 20, 0.9)" }}>Innkeeper</strong>
              <span>Warm bowls, soft bread, and a story for every traveler.</span>
            </div>
          </div>
          {error ? <div style={{ color: "rgba(127, 29, 29, 0.9)" }}>{error}</div> : null}
          {loading ? <div style={{ color: "rgba(15, 23, 42, 0.6)" }}>Loading stock…</div> : null}
          {status ? <div style={{ color: "rgba(15, 23, 42, 0.7)" }}>{status}</div> : null}
        </div>

        <section style={styles.cabinetOuter}>
          <div style={styles.grainOverlay} aria-hidden="true" />
          <div style={styles.cabinetInner}>
            <div style={styles.shelfStage}>
              {stockedItems.length === 0 ? (
                <div style={{ color: "rgba(15, 23, 42, 0.6)" }}>The hearth is quiet today.</div>
              ) : (
                <>
                  <div style={styles.row}>
                    {featuredItems.map((entry) => {
                      const isOwned = entry.item?.id ? ownedSet.has(entry.item.id) : false;
                      const isBusy = purchasingId === entry.id;
                      return (
                        <div key={entry.id} style={styles.card}>
                          <div style={styles.imgWrap}>
                            {entry.item?.image_url ? (
                              <Image
                                src={entry.item.image_url}
                                alt={entry.item.name}
                                width={100}
                                height={100}
                                style={{ width: 100, height: 100, objectFit: "contain" }}
                              />
                            ) : null}
                          </div>
                          <div style={styles.name}>{entry.item?.name}</div>
                          <div style={styles.price}>{entry.price} petals</div>
                          <button
                            type="button"
                            onClick={() => handlePurchase(entry.id)}
                            style={{
                              ...styles.buyButton,
                              ...(isOwned ? styles.buyButtonOwned : null),
                              ...(isOwned || isBusy ? styles.buyButtonDisabled : null),
                            }}
                            disabled={isOwned || isBusy}
                          >
                            {isOwned ? "Owned" : isBusy ? "Purchasing..." : "Purchase"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {gridItems.length > 0 ? (
                    <div style={styles.grid}>
                      {gridItems.map((entry) => {
                        const isOwned = entry.item?.id ? ownedSet.has(entry.item.id) : false;
                        const isBusy = purchasingId === entry.id;
                        return (
                          <div key={entry.id} style={styles.card}>
                            <div style={styles.imgWrap}>
                              {entry.item?.image_url ? (
                                <Image
                                  src={entry.item.image_url}
                                  alt={entry.item.name}
                                  width={100}
                                  height={100}
                                  style={{ width: 100, height: 100, objectFit: "contain" }}
                                />
                              ) : null}
                            </div>
                            <div style={styles.name}>{entry.item?.name}</div>
                            <div style={styles.price}>{entry.price} petals</div>
                            <button
                              type="button"
                              onClick={() => handlePurchase(entry.id)}
                              style={{
                                ...styles.buyButton,
                                ...(isOwned ? styles.buyButtonOwned : null),
                                ...(isOwned || isBusy ? styles.buyButtonDisabled : null),
                              }}
                              disabled={isOwned || isBusy}
                            >
                              {isOwned ? "Owned" : isBusy ? "Purchasing..." : "Purchase"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
