"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

type Item = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string | null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [collected, setCollected] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const userId = getUserId();
      const token = getAccessToken();

      const res = await restFetch<Item[]>("items", {
        select: "id,name,image_url,created_at",
        order: "created_at.desc",
        limit: "6",
      });

      setItems(res ?? []);

      if (userId && token) {
        const collectedRes = await restFetch<{ item_id: string }[]>(
          "user_collected_items",
          { select: "item_id" },
          { token }
        );
        setCollected(new Set<string>((collectedRes ?? []).map((row) => row.item_id)));
      }
    })();
  }, []);

  const slots = useMemo(() => {
    if (items.length >= 6) return items.slice(0, 6);
    return [...items, ...Array.from({ length: 6 - items.length })];
  }, [items]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:px-12">
        <header className="flex flex-col items-center gap-6 text-center">
          <Image
            src="https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/visual/vitrine_brandmark.png"
            alt="Vitrine"
            width={260}
            height={260}
            priority
            style={{ width: "min(260px, 60vw)", height: "auto" }}
          />
          <h1
            className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900"
            style={{ fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif" }}
          >
            A cabinet of quiet discoveries.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Find rare drops. Keep what you collect.
          </p>
        </header>

        <section className="flex justify-center">
          <div
            className="w-full max-w-3xl rounded-[28px] border border-amber-900/20 p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(141, 92, 55, 0.9), rgba(107, 68, 40, 0.9))",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[22px] border border-amber-900/30 p-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(222, 185, 138, 0.95), rgba(204, 160, 112, 0.95))",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "repeating-linear-gradient(12deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 8px)",
                }}
              />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-700">
                <span>Display Shelf</span>
                <span className="rounded-full border border-amber-200/60 bg-white/90 px-3 py-1 text-[11px] tracking-wide">
                  New arrivals
                </span>
              </div>
              <div className="relative mt-5 grid grid-cols-3 gap-3">
                {slots.map((item, idx) => {
                  const isCollected = item?.id ? collected.has(item.id) : false;
                  return (
                  <div
                    key={item?.id ?? `slot-${idx}`}
                    className="flex items-center justify-center rounded-xl border border-amber-200/70 bg-white/90 p-3"
                  >
                    <div
                      className="flex items-center justify-center rounded-[16px] border border-slate-900/15 bg-white"
                      style={{ width: 200, height: 200 }}
                    >
                      {item ? (
                        item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={200}
                            height={200}
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "contain",
                              filter: isCollected ? "none" : "grayscale(100%)",
                              opacity: isCollected ? 1 : 0.26,
                              }}
                            />
                          ) : (
                            <span className="text-xs text-slate-400">No image</span>
                          )
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-dashed border-amber-200/70" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
