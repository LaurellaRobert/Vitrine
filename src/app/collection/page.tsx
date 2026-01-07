"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  name: string;
  sort_order: number | null;
};

type CollectedRow = {
  item_id: string;
};

export default function CollectionPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");

  const collectedCount = collected.size;
  const totalCount = items.length;
  const pct = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((collectedCount / totalCount) * 100);
  }, [collectedCount, totalCount]);

  useEffect(() => {
    (async () => {
      try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!authData.user) {
          setError("Not signed in. Go to /login");
          return;
        }

        // 1) Load items (for now: all items, ordered)
        const itemsRes = await supabase
          .from("items")
          .select("id,name,sort_order")
          .order("sort_order", { ascending: true });

        if (itemsRes.error) throw itemsRes.error;
        setItems(itemsRes.data ?? []);

        // 2) Load collected items for the current user
        const collectedRes = await supabase
          .from("user_collected_items")
          .select("item_id");

        if (collectedRes.error) throw collectedRes.error;

        const set = new Set<string>((collectedRes.data ?? []).map((r: CollectedRow) => r.item_id));
        setCollected(set);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Collection</h1>

      {error ? (
        <pre style={{ marginTop: 16, padding: 12, background: "#111", color: "#fff", borderRadius: 8 }}>
          {error}
        </pre>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <strong>
          {collectedCount} / {totalCount} collected ({pct}%)
        </strong>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 8,
        }}
      >
        {items.map((item, idx) => {
          const isCollected = collected.has(item.id);
          return (
            <div
              key={item.id}
              title={isCollected ? item.name : "Uncollected"}
              style={{
                height: 70,
                borderRadius: 10,
                border: "1px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isCollected ? 1 : 0.25,
                userSelect: "none",
              }}
            >
              {isCollected ? item.name : `#${idx + 1}`}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/library">Go to Library</a>
      </div>
    </main>
  );
}
