"use client";

import { useEffect, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";
import { notifyCurrency } from "@/lib/currency";

const wellImg =
  "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/locations/wishing_well.png";

export default function WellPage() {
  const [status, setStatus] = useState("");
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setGranted(!!row?.granted);
        setStatus(
          row?.granted
            ? "The well hums with gratitude. You received 5 petals."
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
  }, []);

  return (
    <main
      style={{
        color: "rgba(20, 42, 56, 0.92)",
        background:
          "radial-gradient(1200px 720px at 12% 0%, rgba(206, 236, 227, 0.55), transparent 60%)," +
          "radial-gradient(900px 620px at 88% 18%, rgba(206, 220, 255, 0.4), transparent 62%)," +
          "radial-gradient(900px 600px at 50% 85%, rgba(214, 230, 206, 0.45), transparent 60%)," +
          "linear-gradient(180deg, rgba(248, 251, 249, 1), rgba(238, 243, 241, 1))",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "stretch" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 60,
                  lineHeight: 1.02,
                  letterSpacing: -1.1,
                  fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
                }}
              >
                Well of Good Fortune
              </h1>

              <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(20, 42, 56, 0.72)" }}>
                  A moss-soft stone ring, a shimmer of light, and the feeling that something kind is listening.
                </p>
                <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(20, 42, 56, 0.72)" }}>
                  Each day, the well grants a small gift to those who arrive with patience.
                </p>
              </div>

              {loading ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
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
                    marginTop: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(120, 170, 156, 0.4)",
                    background: granted ? "rgba(236, 251, 245, 0.9)" : "rgba(255, 255, 255, 0.85)",
                    fontSize: 14,
                    color: "rgba(20, 70, 60, 0.9)",
                  }}
                >
                  {status}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ flex: "1 1 520px", minWidth: 360, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              {wellImg ? (
                <img
                  src={wellImg}
                  alt="Well of Good Fortune"
                  style={{ width: "min(720px, 100%)", height: "auto", display: "block" }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: "min(520px, 100%)",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 50% 48%, rgba(127, 204, 214, 0.9), rgba(62, 110, 132, 0.9) 45%, rgba(64, 92, 74, 0.9) 70%)," +
                      "radial-gradient(circle at 50% 50%, rgba(215, 230, 228, 0.8), rgba(148, 170, 160, 0.9) 65%)",
                    border: "12px solid rgba(110, 146, 132, 0.8)",
                    boxShadow: "0 18px 40px rgba(64, 92, 74, 0.25)",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
