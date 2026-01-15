"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

type Familiar = {
  name: string | null;
  image_url: string | null;
  hp_current: number;
  hp_max: number;
  strength: number;
  defense: number;
  speed: number;
};

export default function FamiliarPage() {
  const [familiar, setFamiliar] = useState<Familiar | null>(null);
  const [status, setStatus] = useState("");
  const [trainingStatus, setTrainingStatus] = useState("");
  const [trainingClaimed, setTrainingClaimed] = useState(false);
  const [trainingStat, setTrainingStat] = useState<string | null>(null);
  const [trainingGain, setTrainingGain] = useState<number | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);

  const trainingOptions = [
    { key: "hp_max", label: "HP" },
    { key: "strength", label: "Strength" },
    { key: "defense", label: "Defense" },
    { key: "speed", label: "Speed" },
  ];

  const getEstDateString = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  useEffect(() => {
    (async () => {
      try {
        const userId = getUserId();
        const token = getAccessToken();
        if (!userId || !token) {
          setStatus("Sign in to meet your familiar.");
          return;
        }

        const res = await restFetch<Familiar[]>(
          "familiars",
          {
            select: "name,image_url,hp_current,hp_max,strength,defense,speed",
            user_id: `eq.${userId}`,
            limit: "1",
          },
          { token }
        );
        setFamiliar((res ?? [])[0] ?? null);

        const estDate = getEstDateString();
        const trainingRes = await restFetch<{ event_key: string }[]>(
          "user_events",
          {
            select: "event_key",
            event_type: "eq.familiar_training",
            event_day_est: `eq.${estDate}`,
            user_id: `eq.${userId}`,
            limit: "1",
          },
          { token }
        );
        const existingTraining = (trainingRes ?? [])[0]?.event_key ?? null;
        setTrainingClaimed(!!existingTraining);
        setTrainingStat(existingTraining);
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load familiar.");
      }
    })();
  }, []);

  const handleTraining = async (statKey: string) => {
    try {
      setTrainingLoading(true);
      setTrainingStatus("");
      setTrainingGain(null);
      const token = getAccessToken();
      if (!token) {
        setTrainingStatus("Sign in to train your familiar.");
        return;
      }
      const rpc = await restFetch<any>(
        "rpc/claim_familiar_training",
        {},
        { method: "POST", body: { p_stat: statKey }, token }
      );
      const row = Array.isArray(rpc) ? rpc[0] : rpc;
      if (!row?.granted) {
        setTrainingClaimed(true);
        setTrainingStat(row?.stat ?? statKey);
        setTrainingStatus("Your familiar has already trained today.");
        return;
      }
      const gain = Number(row?.gain ?? 0);
      const newValue = Number(row?.new_value ?? 0);
      setTrainingClaimed(true);
      setTrainingStat(statKey);
      setTrainingGain(gain);
      setTrainingStatus(`Training complete. +${gain} ${statKey === "hp_max" ? "HP" : statKey}.`);

      setFamiliar((prev) => {
        if (!prev) return prev;
        if (statKey === "hp_max") {
          return { ...prev, hp_max: newValue, hp_current: prev.hp_current + gain };
        }
        if (statKey === "strength") {
          return { ...prev, strength: newValue };
        }
        if (statKey === "defense") {
          return { ...prev, defense: newValue };
        }
        if (statKey === "speed") {
          return { ...prev, speed: newValue };
        }
        return prev;
      });
    } catch (e: any) {
      setTrainingStatus(e?.message ?? "Training failed.");
    } finally {
      setTrainingLoading(false);
    }
  };

  return (
    <main
      style={{
        color: "rgba(34, 52, 80, 0.92)",
        background:
          "radial-gradient(1200px 720px at 12% 0%, rgba(214, 225, 242, 0.55), transparent 60%)," +
          "radial-gradient(900px 620px at 88% 18%, rgba(225, 236, 255, 0.45), transparent 62%)," +
          "linear-gradient(180deg, rgba(248, 250, 255, 1), rgba(236, 241, 250, 1))",
        minHeight: "calc(100vh - 64px)",
        padding: "46px 20px 72px",
      }}
    >
      <section style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 54,
                lineHeight: 1.02,
                letterSpacing: -1.1,
                fontFamily: "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif",
              }}
            >
              Familiar Study
            </h1>
            <p style={{ margin: 0, lineHeight: 1.8, fontSize: 17, color: "rgba(34, 52, 80, 0.74)" }}>
              The room is quiet. Your familiar rests here, waiting for your next lesson.
            </p>
          </header>

          {status ? (
            <div
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(120, 140, 180, 0.35)",
                background: "rgba(255, 255, 255, 0.85)",
                fontSize: 14,
              }}
            >
              {status}
            </div>
          ) : null}

          {familiar ? (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(260px, 1fr)", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {familiar.image_url ? (
                  <Image
                    src={familiar.image_url}
                    alt={familiar.name ?? "Familiar"}
                    width={900}
                    height={900}
                    priority
                    style={{
                      width: "min(420px, 100%)",
                      height: "auto",
                      display: "block",
                      borderRadius: 24,
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: "min(420px, 100%)",
                      aspectRatio: "1 / 1",
                      borderRadius: 24,
                      border: "1px dashed rgba(120, 140, 180, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(34, 52, 80, 0.6)",
                      background: "rgba(255, 255, 255, 0.7)",
                      fontSize: 13,
                    }}
                  >
                    Familiar portrait
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(120, 140, 180, 0.35)",
                  background: "rgba(255, 255, 255, 0.9)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600 }}>{familiar.name ?? "Your familiar"}</div>
                <div>HP: {familiar.hp_current} / {familiar.hp_max}</div>
                <div>Strength: {familiar.strength}</div>
                <div>Defense: {familiar.defense}</div>
                <div>Speed: {familiar.speed}</div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "rgba(120, 140, 180, 0.8)",
                    }}
                  >
                    Daily lesson
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                    {trainingOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleTraining(option.key)}
                        disabled={trainingLoading || trainingClaimed}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(120, 140, 180, 0.35)",
                          background: trainingClaimed ? "rgba(235, 240, 247, 0.8)" : "rgba(248, 251, 255, 0.95)",
                          padding: "8px 10px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "rgba(34, 52, 80, 0.88)",
                          cursor: trainingClaimed ? "not-allowed" : "pointer",
                          opacity: trainingLoading ? 0.7 : 1,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {trainingStatus ? (
                    <div style={{ fontSize: 13, color: "rgba(34, 52, 80, 0.74)" }}>{trainingStatus}</div>
                  ) : trainingClaimed && trainingStat ? (
                    <div style={{ fontSize: 13, color: "rgba(34, 52, 80, 0.62)" }}>
                      Trained today ({trainingStat === "hp_max" ? "HP" : trainingStat}
                      {typeof trainingGain === "number" ? ` +${trainingGain}` : ""}).
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
