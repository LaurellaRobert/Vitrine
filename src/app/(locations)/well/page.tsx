"use client";

import { useEffect, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";
import { notifyCurrency } from "@/lib/currency";

const wellBackground =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/vitrine_locations_large.webp";

export default function WellPage() {
  const [status, setStatus] = useState("");
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<number | null>(null);
  const [petalsAwarded, setPetalsAwarded] = useState<number | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    (async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const userId = getUserId();
        if (!token || !userId) {
          setStatus("Sign in to make a wish at the well.");
          return;
        }

        const rpc = await restFetch<any>(
          "rpc/claim_daily_petals",
          {},
          { method: "POST", body: { p_event_key: "well" }, token }
        );
        const row = Array.isArray(rpc) ? rpc[0] : rpc;
        const newBalance = row?.new_balance ?? null;
        const nextStreak = typeof row?.streak === "number" ? row.streak : null;
        const award =
          typeof row?.petals_awarded === "number"
            ? row.petals_awarded
            : nextStreak
            ? nextStreak * 5
            : row?.granted
            ? 5
            : 0;
        setGranted(!!row?.granted);
        setStreak(nextStreak);
        setPetalsAwarded(award);
        setStatus(
          row?.granted
            ? `The well hums with gratitude. You received ${award} petals${nextStreak ? ` (day ${nextStreak}).` : "."}`
            : "The well is quiet for now. Return tomorrow."
        );
        if (typeof newBalance === "number") {
          notifyCurrency(newBalance);
        }
      } catch (e: any) {
        setStatus(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  return (
    <main
      style={{
        color: "rgba(20, 42, 56, 0.92)",
        position: "relative",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${wellBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <section style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              padding: "22px 24px",
              borderRadius: 22,
              border: "1px solid rgba(120, 170, 156, 0.5)",
              background: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 18px 44px rgba(20, 40, 32, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 360px", minWidth: 260 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 52,
                    lineHeight: 1.02,
                    letterSpacing: -1.1,
                    fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                  }}
                >
                  Well of Good Fortune
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                  <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(20, 42, 56, 0.72)" }}>
                    A moss-soft stone ring, a shimmer of light, and the feeling that something kind is listening.
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(20, 42, 56, 0.72)" }}>
                    Each day, the well grants a small gift to those who arrive with patience.
                  </p>
                </div>
              </div>
              <div style={{ flex: "1 1 320px", minWidth: 240, display: "grid", gap: 12 }}>
                {loading ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(120, 170, 156, 0.4)",
                      background: "rgba(255, 255, 255, 0.85)",
                      fontSize: 14,
                    }}
                  >
                    The water stirs…
                  </div>
                ) : status ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      border: "1px solid rgba(120, 170, 156, 0.4)",
                      background: granted ? "rgba(236, 251, 245, 0.92)" : "rgba(255, 255, 255, 0.85)",
                      fontSize: 14,
                      color: "rgba(20, 70, 60, 0.9)",
                    }}
                  >
                    {status}
                  </div>
                ) : null}

                {streak !== null ? (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 16,
                      border: "1px solid rgba(120, 170, 156, 0.4)",
                      background: "rgba(255, 255, 255, 0.9)",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        color: "rgba(20, 70, 60, 0.7)",
                      }}
                    >
                      Wishing streak
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "rgba(20, 70, 60, 0.9)" }}>
                        {streak} days
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(20, 70, 60, 0.7)" }}>
                        Next reward: {(streak + 1) * 5} petals
                      </div>
                    </div>
                    {granted && petalsAwarded !== null ? (
                      <div style={{ fontSize: 13, color: "rgba(20, 70, 60, 0.7)" }}>
                        Today&apos;s grant: {petalsAwarded} petals.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
