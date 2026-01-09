"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string | null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      const res = await supabase
        .from("items")
        .select("id,name,image_url,created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!res.error) setItems(res.data ?? []);
    })();
  }, []);

  const slots = useMemo(() => {
    if (items.length >= 6) return items.slice(0, 6);
    return [...items, ...Array.from({ length: 6 - items.length })];
  }, [items]);

  return (
    <div
      className="min-h-screen bg-[#f6f1e7] font-sans text-slate-900"
      style={{
        background:
          "radial-gradient(1200px 700px at 10% 0%, rgba(245, 232, 210, 0.85), transparent 60%)," +
          "radial-gradient(900px 620px at 92% 12%, rgba(255, 239, 216, 0.75), transparent 62%)," +
          "linear-gradient(180deg, rgba(252, 249, 244, 1), rgba(244, 238, 228, 1))",
      }}
    >
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 lg:px-12">
        <header className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-2xl border border-amber-200/70 bg-amber-50 shadow-sm"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 231, 198, 0.9))",
            }}
          />
          <div className="flex flex-col">
            <span
              className="text-xs uppercase tracking-[0.3em] text-amber-700"
              style={{ fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif" }}
            >
              Vitrine
            </span>
          </div>
        </header>

        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/70 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-amber-800">
              The Cabinet Opens
            </div>
            <h1
              className="max-w-xl text-4xl font-semibold leading-tight text-slate-900"
              style={{ fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif" }}
            >
              A collection game of quiet rituals, rare drops, and progress that never goes backward.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Explore locations. Actions create events. Events unlock items. The collection is append-only and
              remembers every visit.
            </p>

            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full bg-amber-700 px-6 text-base font-medium text-amber-50 shadow-md shadow-amber-900/10 transition-colors hover:bg-amber-800 sm:w-auto"
                href="/collection"
              >
                View collection
              </Link>

              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-amber-200/80 bg-white/70 px-6 text-base font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-white sm:w-auto"
                href="/library"
              >
                Explore
              </Link>

              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-slate-200/80 bg-white/60 px-6 text-base font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white sm:w-auto"
                href="/login"
              >
                Login
              </Link>
            </div>
          </div>

          <div
            className="rounded-[28px] border border-amber-900/20 p-6 shadow-xl shadow-amber-900/10"
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
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 8px)," +
                    "repeating-linear-gradient(12deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 8px)",
                }}
              />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-700">
                <span>Display Shelf</span>
                <span className="rounded-full border border-amber-200/60 bg-white/80 px-3 py-1 text-[11px] tracking-wide">
                  New arrivals
                </span>
              </div>
              <div className="relative mt-5 grid grid-cols-3 gap-3">
                {slots.map((item, idx) => (
                  <div
                    key={item?.id ?? `slot-${idx}`}
                    className="flex aspect-square items-center justify-center rounded-xl border border-amber-200/70 bg-white/90 p-2 shadow-sm"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] border border-slate-900/15 bg-white">
                      {item ? (
                        item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={64}
                            height={64}
                            style={{ width: 64, height: 64, objectFit: "contain" }}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No image</span>
                        )
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-dashed border-amber-200/70" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="h-3 w-full rounded-full bg-amber-200/70">
                  <div className="h-full w-[68%] rounded-full bg-amber-600/80" />
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  Every room adds a new thread to the cabinet. Progress is a slow, certain glow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-sm text-slate-600">
          <div className="flex flex-wrap gap-4">
            <span>Locations: Library, Museum, Cafe, Castle, Garden, Great Hall</span>
            <span>Rule: unlocks are permanent</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
