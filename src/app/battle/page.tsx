"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trackPageVisit } from "@/lib/track";
import { addNotification } from "@/lib/notifications";
import { getAccessToken, getUserId, restFetch } from "@/lib/supabaseRest";

type IconMap = Record<string, number>;

type Weapon = {
  id: string;
  name: string;
  attack_icons: IconMap | null;
  item_id?: string | null;
  image_url?: string | null;
};

type Shield = {
  id: string;
  name: string;
  block_icons: IconMap | null;
  item_id?: string | null;
  image_url?: string | null;
};

type Item = {
  id: string;
  name: string;
  image_url: string | null;
};

type Opponent = {
  id: string;
  name: string;
  hp: number;
  strength: number;
  defense: number;
  speed: number;
  image_url?: string | null;
};

type BattleResult = {
  user_damage: number;
  enemy_damage: number;
  winner: "user" | "enemy" | "draw";
  opponent_weapon_id?: string | null;
  opponent_shield_id?: string | null;
  opponent_scaled_hp?: number | null;
  battle_exp?: number | null;
  battle_level?: number | null;
  exp_gain?: number | null;
};

type Familiar = {
  name: string | null;
  image_url: string | null;
  hp_current: number;
  hp_max: number;
};

export default function BattlePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [shields, setShields] = useState<Shield[]>([]);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [familiar, setFamiliar] = useState<Familiar | null>(null);
  const [weaponId, setWeaponId] = useState("");
  const [shieldId, setShieldId] = useState("");
  const [opponentId, setOpponentId] = useState("");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleWinner, setBattleWinner] = useState<BattleResult["winner"] | null>(null);
  const [userHp, setUserHp] = useState<number | null>(null);
  const [enemyHp, setEnemyHp] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [itemMap, setItemMap] = useState<Record<string, Item>>({});
  const [loadoutWeapons, setLoadoutWeapons] = useState<string[]>([]);
  const [loadoutShields, setLoadoutShields] = useState<string[]>([]);
  const [dropBanner, setDropBanner] = useState(false);
  const [battleExp, setBattleExp] = useState<number | null>(null);
  const [battleLevel, setBattleLevel] = useState<number | null>(null);
  const [opponentProgress, setOpponentProgress] = useState<Record<string, { wins: number; losses: number }>>({});
  const [lastExpGain, setLastExpGain] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [weaponRows, shieldRows, opponentRows] = await Promise.all([
          restFetch<Weapon[]>("weapons", {
            select: "id,name,attack_icons,item_id,image_url",
            order: "name.asc",
          }),
          restFetch<Shield[]>("shields", {
            select: "id,name,block_icons,item_id,image_url",
            order: "name.asc",
          }),
          restFetch<Opponent[]>("opponents", {
            select: "id,name,hp,strength,defense,speed,image_url",
            order: "name.asc",
          }),
        ]);
        const preferredOpponent = searchParams?.get("opponent") ?? "";
        const hasActiveBattle = typeof window !== "undefined" && sessionStorage.getItem("battle_active") === "1";

        setWeapons(weaponRows);
        setShields(shieldRows);
        setOpponents(opponentRows);
        const weaponUnlockIds = weaponRows.map((weapon) => weapon.item_id).filter(Boolean) as string[];
        const shieldUnlockIds = shieldRows.map((shield) => shield.item_id).filter(Boolean) as string[];
        const allItemIds = Array.from(new Set([...weaponUnlockIds, ...shieldUnlockIds]));
        if (allItemIds.length > 0) {
          const itemsRes = await restFetch<Item[]>("items", {
            select: "id,name,image_url",
            id: `in.(${allItemIds.join(",")})`,
          });
          const nextMap: Record<string, Item> = {};
          (itemsRes ?? []).forEach((item) => {
            nextMap[item.id] = item;
          });
          setItemMap(nextMap);
        } else {
          setItemMap({});
        }
        if (preferredOpponent && opponentRows.some((o) => o.id === preferredOpponent) && hasActiveBattle) {
          setOpponentId(preferredOpponent);
        } else if (preferredOpponent && !hasActiveBattle) {
          setOpponentId("");
          router.replace("/battle/opponents");
        } else {
          setOpponentId("");
        }

        const userId = getUserId();
        const token = getAccessToken();
        if (userId && token) {
          const unlockIds = Array.from(new Set([...weaponUnlockIds, ...shieldUnlockIds]));
          if (unlockIds.length > 0) {
            const ownedRes = await restFetch<{ item_id: string }[]>(
              "user_collected_items",
              { select: "item_id", item_id: `in.(${unlockIds.join(",")})` },
              { token }
            );
            const ownedIds = (ownedRes ?? []).map((row) => row.item_id);
            setOwnedItemIds(ownedIds);
            const firstOwnedWeapon = weaponRows.find((weapon) => weapon.item_id && ownedIds.includes(weapon.item_id));
            const firstOwnedShield = shieldRows.find((shield) => shield.item_id && ownedIds.includes(shield.item_id));
            const firstWeaponId = firstOwnedWeapon?.id ?? "";
            const firstShieldId = firstOwnedShield?.id ?? "";
            setWeaponId(firstWeaponId);
            setShieldId(firstShieldId);
            setLoadoutWeapons((prev) => (prev.length ? prev : firstWeaponId ? [firstWeaponId] : []));
            setLoadoutShields((prev) => (prev.length ? prev : firstShieldId ? [firstShieldId] : []));
          } else {
            setOwnedItemIds([]);
            setWeaponId("");
            setShieldId("");
            setLoadoutWeapons([]);
            setLoadoutShields([]);
          }

          const familiarRes = await restFetch<Familiar[]>(
            "familiars",
            {
              select: "name,image_url,hp_current,hp_max",
              user_id: `eq.${userId}`,
              limit: "1",
            },
            { token }
          );
          setFamiliar((familiarRes ?? [])[0] ?? null);

          const battleStatsRes = await restFetch<{ exp: number; level: number }[]>(
            "user_battle_stats",
            { select: "exp,level", user_id: `eq.${userId}`, limit: "1" },
            { token }
          );
          const statsRow = (battleStatsRes ?? [])[0];
          if (statsRow) {
            setBattleExp(statsRow.exp);
            setBattleLevel(statsRow.level);
          }

          const opponentStatsRes = await restFetch<{ opponent_id: string; wins: number; losses: number }[]>(
            "user_opponent_stats",
            { select: "opponent_id,wins,losses" },
            { token }
          );
          const nextProgress: Record<string, { wins: number; losses: number }> = {};
          (opponentStatsRes ?? []).forEach((row) => {
            nextProgress[row.opponent_id] = { wins: row.wins, losses: row.losses };
          });
          setOpponentProgress(nextProgress);
        } else {
          setOwnedItemIds([]);
          setWeaponId("");
          setShieldId("");
          setLoadoutWeapons([]);
          setLoadoutShields([]);
          setBattleExp(null);
          setBattleLevel(null);
          setOpponentProgress({});
        }
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load battle data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedWeapon = useMemo(() => weapons.find((w) => w.id === weaponId), [weapons, weaponId]);
  const selectedShield = useMemo(() => shields.find((s) => s.id === shieldId), [shields, shieldId]);
  const selectedOpponent = useMemo(
    () => opponents.find((o) => o.id === opponentId),
    [opponents, opponentId]
  );
  const ownedSet = useMemo(() => new Set(ownedItemIds), [ownedItemIds]);
  const isWeaponUnlocked = (weapon: Weapon) => {
    return weapon.item_id ? ownedSet.has(weapon.item_id) : false;
  };
  const isShieldUnlocked = (shield: Shield) => {
    return shield.item_id ? ownedSet.has(shield.item_id) : false;
  };
  const unlockedWeapons = useMemo(() => weapons.filter(isWeaponUnlocked), [weapons, ownedItemIds]);
  const unlockedShields = useMemo(() => shields.filter(isShieldUnlocked), [shields, ownedItemIds]);
  const selectedWeaponItem = selectedWeapon?.item_id ? itemMap[selectedWeapon.item_id] : null;
  const selectedShieldItem = selectedShield?.item_id ? itemMap[selectedShield.item_id] : null;
  const opponentWeapon = result?.opponent_weapon_id
    ? weapons.find((weapon) => weapon.id === result.opponent_weapon_id)
    : null;
  const opponentShield = result?.opponent_shield_id
    ? shields.find((shield) => shield.id === result.opponent_shield_id)
    : null;
  const opponentWeaponItem = opponentWeapon?.item_id ? itemMap[opponentWeapon.item_id] : null;
  const opponentShieldItem = opponentShield?.item_id ? itemMap[opponentShield.item_id] : null;
  const opponentWeaponImage = opponentWeaponItem?.image_url ?? opponentWeapon?.image_url ?? null;
  const opponentShieldImage = opponentShieldItem?.image_url ?? opponentShield?.image_url ?? null;
  const opponentWins = opponentId ? opponentProgress[opponentId]?.wins ?? 0 : 0;
  const opponentScale = 1 + opponentWins * 0.06;
  const scaledOpponentHp = selectedOpponent ? Math.round(selectedOpponent.hp * opponentScale) : 0;

  const renderIcons = (map: IconMap | null) => {
    if (!map) return "—";
    return Object.entries(map)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  const iconUrls: Record<string, string> = {
    dark: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/dark.png",
    earth: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/earth.png",
    fire: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/fire.png",
    light: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/light.png",
    lightning:
      "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/lightning.png",
    physical:
      "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/physical.png",
    water: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/water.png",
    wind: "https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/battle/icons/wind.png",
  };

  const renderIconSprites = (
    map: IconMap | null,
    variant: "attack" | "block" = "attack",
    align: "left" | "right" = "left"
  ) => {
    if (!map) return null;
    const icons: { key: string; idx: number }[] = [];
    Object.entries(map).forEach(([key, value]) => {
      for (let i = 0; i < value; i += 1) {
        icons.push({ key, idx: i });
      }
    });
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        {icons.map((icon, index) => {
          const src = iconUrls[icon.key];
          if (!src) return null;
          return (
            <img
              key={`${icon.key}-${icon.idx}-${index}`}
              alt={`${icon.key} icon`}
              src={src}
              width={40}
              height={40}
              style={{
                width: 40,
                height: 40,
                display: "block",
                filter: variant === "block" ? "grayscale(100%)" : "none",
                opacity: variant === "block" ? 0.75 : 1,
              }}
            />
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    setBattleStarted(false);
    setBattleWinner(null);
    setResult(null);
    setUserHp(null);
    setEnemyHp(null);
    setShowResults(false);
  }, [opponentId]);

  useEffect(() => {
    if (!weaponId && unlockedWeapons[0]) {
      setWeaponId(unlockedWeapons[0].id);
    }
  }, [weaponId, unlockedWeapons]);

  useEffect(() => {
    if (!shieldId && unlockedShields[0]) {
      setShieldId(unlockedShields[0].id);
    }
  }, [shieldId, unlockedShields]);

  useEffect(() => {
    if (loadoutWeapons.length === 0 && unlockedWeapons[0]) {
      setLoadoutWeapons([unlockedWeapons[0].id]);
    }
  }, [loadoutWeapons.length, unlockedWeapons]);

  useEffect(() => {
    if (loadoutShields.length === 0 && unlockedShields[0]) {
      setLoadoutShields([unlockedShields[0].id]);
    }
  }, [loadoutShields.length, unlockedShields]);

  useEffect(() => {
    (async () => {
      try {
        const res = await trackPageVisit("battle");
        if (res.unlockedCount > 0) {
          setDropBanner(true);
          for (let i = 0; i < res.unlockedCount; i += 1) {
            addNotification("You found a new item in the Marionette Ring.");
          }
        }
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to record the ring visit.");
      }
    })();
  }, []);

  const beginBattle = () => {
    if (!selectedOpponent) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("battle_active", "1");
    }
    const startingUserHp = familiar?.hp_current ?? familiar?.hp_max ?? 0;
    setUserHp(startingUserHp);
    setEnemyHp(scaledOpponentHp || selectedOpponent.hp);
    setBattleStarted(true);
    setBattleWinner(null);
    setResult(null);
    setShowResults(false);
    setLastExpGain(null);
    setStatus("The ring awakens. Choose your turn.");
  };

  const openResults = () => {
    setShowResults(true);
    setBattleStarted(false);
    setUserHp(userHpMax);
    setEnemyHp(enemyHpMax);
    setStatus("The ring settles and restores its champions.");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("battle_active");
    }
  };

  const handleRematch = () => {
    setShowResults(false);
    beginBattle();
  };

  const handleReturnToGallery = () => {
    setShowResults(false);
    setBattleWinner(null);
    setResult(null);
    setOpponentId("");
    setStatus("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("battle_active");
    }
    router.push("/battle/opponents");
  };

  const resolveBattle = async () => {
    if (!weaponId || !shieldId || !opponentId || !battleStarted || battleWinner) return;
    if (!selectedWeapon || !selectedShield) return;
    if (!isWeaponUnlocked(selectedWeapon) || !isShieldUnlocked(selectedShield)) {
      setStatus("Your familiar cannot wield items that you haven't collected.");
      return;
    }
    try {
      setResolving(true);
      setStatus("");
      setResult(null);
      const token = getAccessToken();
      if (!token) {
        setStatus("Sign in to battle.");
        return;
      }
      const rpc = await restFetch<any>(
        "rpc/resolve_battle",
        {},
        {
          method: "POST",
          body: {
            p_opponent_id: opponentId,
            p_weapon_id: weaponId,
            p_shield_id: shieldId,
          },
          token,
        }
      );
      const row = Array.isArray(rpc) ? rpc[0] : rpc;
      const battleRow = row as BattleResult;
      const nextUserHp = Math.max(0, (userHp ?? 0) - battleRow.enemy_damage);
      const nextEnemyHp = Math.max(0, (enemyHp ?? 0) - battleRow.user_damage);

      setUserHp(nextUserHp);
      setEnemyHp(nextEnemyHp);
      setResult(battleRow);

      const isBattleOver = nextUserHp <= 0 || nextEnemyHp <= 0;
      const battleOutcome = nextUserHp <= 0 && nextEnemyHp <= 0 ? "draw" : nextUserHp <= 0 ? "enemy" : "user";

      if (isBattleOver) {
        setBattleWinner(battleOutcome);
        setStatus("The duel ends. The ring grows still.");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("battle_active");
        }
        const results = await restFetch<{ battle_exp: number; battle_level: number; exp_gain: number }[]>(
          "rpc/record_battle_result",
          {},
          {
            method: "POST",
            body: {
              p_opponent_id: opponentId,
              p_result: battleOutcome,
            },
            token,
          }
        );
        const resultRow = Array.isArray(results) ? results[0] : results;
        if (resultRow) {
          if (typeof resultRow.battle_exp === "number") {
            setBattleExp(resultRow.battle_exp);
          }
          if (typeof resultRow.battle_level === "number") {
            setBattleLevel(resultRow.battle_level);
          }
          if (typeof resultRow.exp_gain === "number") {
            setLastExpGain(resultRow.exp_gain);
          }
        }
        if (opponentId) {
          setOpponentProgress((prev) => {
            const current = prev[opponentId] ?? { wins: 0, losses: 0 };
            const next =
              battleOutcome === "user"
                ? { wins: current.wins + 1, losses: current.losses }
                : battleOutcome === "enemy"
                ? { wins: current.wins, losses: current.losses + 1 }
                : current;
            return { ...prev, [opponentId]: next };
          });
        }
      } else {
        setStatus("The clash resolves in a single breath.");
      }
    } catch (e: any) {
      setStatus(e?.message ?? "Battle failed.");
    } finally {
      setResolving(false);
    }
  };

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
      maxWidth: 1180,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 16,
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
      maxWidth: 680,
    },
    panel: {
      borderRadius: 18,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.92)",
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    galleryGrid: {
      display: "grid",
      gap: 16,
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    },
    galleryCard: {
      borderRadius: 16,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.92)",
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "center",
      textAlign: "center",
    },
    galleryName: {
      fontSize: 16,
      fontWeight: 700,
      color: "rgba(83, 46, 20, 0.92)",
    },
    galleryStats: {
      fontSize: 13,
      color: "rgba(15, 23, 42, 0.7)",
    },
    duelRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
      alignItems: "center",
    },
    duelLayout: {
      display: "grid",
      gridTemplateColumns: "minmax(360px, 1.1fr) minmax(280px, 0.9fr)",
      gap: 18,
      alignItems: "start",
    },
    turnPanel: {
      borderRadius: 16,
      border: "1px solid rgba(120, 90, 60, 0.22)",
      background: "rgba(255,255,255,0.92)",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    portrait: {
      borderRadius: 18,
      border: "1px solid rgba(120, 90, 60, 0.2)",
      background: "rgba(255,255,255,0.92)",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    },
    portraitImg: {
      width: "min(260px, 100%)",
      height: "auto",
      display: "block",
      borderRadius: 16,
    },
    hpWrap: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    hpTrack: {
      width: "100%",
      height: 10,
      borderRadius: 999,
      background: "rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
      border: "1px solid rgba(120, 90, 60, 0.22)",
    },
    hpFill: {
      height: "100%",
      background: "linear-gradient(90deg, rgba(97, 181, 132, 0.95), rgba(63, 140, 98, 0.95))",
      borderRadius: 999,
      transition: "width 200ms ease",
    },
    hpText: {
      fontSize: 12,
      color: "rgba(15, 23, 42, 0.7)",
    },
    label: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: "rgba(120, 90, 60, 0.7)",
    },
    select: {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid rgba(120, 90, 60, 0.25)",
      background: "rgba(255,255,255,0.95)",
      fontSize: 14,
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    loadoutRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 16,
    },
    loadoutGrid: {
      display: "grid",
      gap: 12,
      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    },
    loadoutCard: {
      borderRadius: 12,
      border: "1px solid rgba(120, 90, 60, 0.2)",
      background: "rgba(255,255,255,0.94)",
      padding: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
    },
    loadoutCardActive: {
      border: "1px solid rgba(156, 108, 62, 0.7)",
      background: "rgba(255, 242, 221, 0.98)",
    },
    loadoutImageWrap: {
      width: 72,
      height: 72,
      borderRadius: 12,
      border: "1px solid rgba(15, 23, 42, 0.16)",
      background: "rgba(255,255,255,0.98)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      boxSizing: "border-box",
    },
    loadoutLabel: {
      fontSize: 11,
      fontWeight: 600,
      textAlign: "center",
      color: "rgba(15, 23, 42, 0.78)",
    },
    info: {
      fontSize: 13,
      color: "rgba(15, 23, 42, 0.7)",
    },
    button: {
      alignSelf: "flex-start",
      padding: "10px 16px",
      borderRadius: 999,
      border: "1px solid rgba(120, 90, 60, 0.35)",
      background: "rgba(255, 235, 206, 1)",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  const opponentReady = !!opponentId && !!selectedOpponent;
  const userHpMax = familiar?.hp_max ?? 0;
  const enemyHpMax = selectedOpponent ? scaledOpponentHp : 0;
  const userHpRatio = userHpMax ? Math.max(0, Math.min(1, (userHp ?? userHpMax) / userHpMax)) : 0;
  const enemyHpRatio = enemyHpMax ? Math.max(0, Math.min(1, (enemyHp ?? enemyHpMax) / enemyHpMax)) : 0;
  const nextBattleExp =
    battleLevel && battleLevel > 0 ? Math.floor(100 * Math.pow(1.35, battleLevel - 1)) : null;
  const duelPortraits = (
    <div style={styles.duelRow}>
      <div style={styles.portrait}>
        {familiar?.image_url ? (
          <img
            src={familiar.image_url}
            alt={familiar.name ?? "Your familiar"}
            style={styles.portraitImg}
          />
        ) : (
          <div style={{ ...styles.portraitImg, aspectRatio: "1 / 1", background: "rgba(240, 240, 240, 0.8)" }} />
        )}
        <div style={styles.galleryName}>{familiar?.name ?? "Your familiar"}</div>
        {battleStarted ? (
          <div style={styles.hpWrap}>
            <div style={styles.hpTrack}>
              <div style={{ ...styles.hpFill, width: `${userHpRatio * 100}%` }} />
            </div>
            <div style={styles.hpText}>
              HP {userHp ?? userHpMax} / {userHpMax}
            </div>
          </div>
        ) : null}
      </div>
      <div style={styles.portrait}>
        {selectedOpponent?.image_url ? (
          <img
            src={selectedOpponent.image_url}
            alt={selectedOpponent.name}
            style={styles.portraitImg}
          />
        ) : (
          <div style={{ ...styles.portraitImg, aspectRatio: "1 / 1", background: "rgba(240, 240, 240, 0.8)" }} />
        )}
        <div style={styles.galleryName}>{selectedOpponent?.name}</div>
        {battleStarted ? (
          <div style={styles.hpWrap}>
            <div style={styles.hpTrack}>
              <div style={{ ...styles.hpFill, width: `${enemyHpRatio * 100}%` }} />
            </div>
            <div style={styles.hpText}>
              HP {enemyHp ?? enemyHpMax} / {enemyHpMax}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <h1 style={styles.title}>Marionette Ring</h1>
            <Link
              href="/battle/highscores"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(120, 90, 60, 0.25)",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                color: "rgba(83, 46, 20, 0.9)",
                textDecoration: "none",
              }}
            >
              High Scores
            </Link>
          </div>
          <p style={styles.subtitle}>
            Select an opponent, step into the ring, and resolve each turn as a single decisive moment.
          </p>
          {battleLevel !== null && battleExp !== null ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(120, 90, 60, 0.25)",
                  background: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  color: "rgba(83, 46, 20, 0.9)",
                }}
              >
                Battle level {battleLevel}
              </div>
              {nextBattleExp ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(120, 90, 60, 0.25)",
                    background: "rgba(255,255,255,0.9)",
                    fontSize: 13,
                    color: "rgba(83, 46, 20, 0.9)",
                  }}
                >
                  {battleExp} / {nextBattleExp} exp
                </div>
              ) : null}
            </div>
          ) : null}
        </header>

        {dropBanner ? (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(191, 147, 102, 0.4)",
              background: "rgba(255, 245, 228, 0.9)",
              color: "rgba(92, 45, 12, 0.9)",
              fontSize: 14,
            }}
          >
            You found a new item in the Marionette Ring.
          </div>
        ) : null}
        <section style={styles.panel}>
          {loading ? <div style={styles.info}>Summoning loadouts…</div> : null}
          {status ? <div style={styles.info}>{status}</div> : null}

          {!opponentReady ? (
            <div style={styles.panel}>
              <div style={styles.label}>Choose an opponent</div>
              <div style={styles.info}>
                The ring awaits a challenger. Visit the gallery to select a foe.
              </div>
              <button type="button" style={styles.button} onClick={() => router.push("/battle/opponents")}>
                Visit the gallery
              </button>
            </div>
          ) : (
            <>
              {showResults ? (
                <div style={styles.panel}>
                  {duelPortraits}
                  <div style={styles.label}>Results</div>
                  <div style={styles.info}>
                    {battleWinner === "user"
                      ? "Victory! The ring whispers of your skill."
                      : battleWinner === "enemy"
                      ? "Defeat. The ring asks you to try again."
                      : "A draw. The ring is evenly matched."}
                  </div>
                  <div style={styles.info}>
                    Rewards: A hush of applause, a carved token, and a promise of greater spoils.
                  </div>
                  {lastExpGain !== null ? (
                    <div style={styles.info}>EXP earned: {lastExpGain}</div>
                  ) : null}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" style={styles.button} onClick={handleRematch}>
                      Rematch
                    </button>
                    <button type="button" style={styles.button} onClick={handleReturnToGallery}>
                      Return to gallery
                    </button>
                  </div>
                </div>
              ) : !battleStarted ? (
                <>
                  {duelPortraits}
                  <button
                    type="button"
                    style={styles.button}
                    onClick={beginBattle}
                    disabled={!familiar || unlockedWeapons.length === 0 || unlockedShields.length === 0}
                  >
                    {!familiar
                      ? "Sign in to begin"
                      : unlockedWeapons.length === 0 || unlockedShields.length === 0
                      ? "Unlock a weapon and shield"
                      : "Enter the ring"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={styles.duelLayout}>
                      {duelPortraits}
                      <div style={styles.turnPanel}>
                        <div style={styles.label}>Choose this turn</div>
                        <div style={styles.info}>Select a weapon and shield from your loadout.</div>
                        {!weaponId || !shieldId ? (
                          <div style={styles.info}>Pick one of each to take your turn.</div>
                        ) : null}
                        {unlockedWeapons.length === 0 || unlockedShields.length === 0 ? (
                          <div style={styles.info}>Unlock a weapon and shield to enter the ring.</div>
                        ) : null}
                        <div style={styles.loadoutRow}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={styles.label}>
                              Weapons ({loadoutWeapons.length}/10)
                            </div>
                            <div style={styles.loadoutGrid}>
                              {unlockedWeapons.map((weapon) => {
                                const isSelected = loadoutWeapons.includes(weapon.id);
                                const item = weapon.item_id ? itemMap[weapon.item_id] : null;
                                const atLimit = loadoutWeapons.length >= 10;
                                return (
                                  <button
                                    key={weapon.id}
                                    type="button"
                                    onClick={() => {
                                      setLoadoutWeapons((prev) => {
                                        if (atLimit && !prev.includes(weapon.id)) return prev;
                                        if (prev.includes(weapon.id)) {
                                          setWeaponId(weapon.id);
                                          return prev;
                                        }
                                        const next = [...prev, weapon.id];
                                        setWeaponId(weapon.id);
                                        return next;
                                      });
                                    }}
                                    style={{
                                      ...styles.loadoutCard,
                                      ...(isSelected ? styles.loadoutCardActive : null),
                                      opacity: !isSelected && atLimit ? 0.6 : 1,
                                    }}
                                  >
                                    <div style={styles.loadoutImageWrap}>
                                      {item?.image_url ? (
                                        <img
                                          src={item.image_url}
                                          alt={weapon.name}
                                          width={80}
                                          height={80}
                                          style={{ width: 80, height: 80, objectFit: "contain" }}
                                        />
                                      ) : (
                                        <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                                      )}
                                    </div>
                                    <div style={styles.loadoutLabel}>{weapon.name}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={styles.label}>
                              Shields ({loadoutShields.length}/10)
                            </div>
                            <div style={styles.loadoutGrid}>
                              {unlockedShields.map((shield) => {
                                const isSelected = loadoutShields.includes(shield.id);
                                const item = shield.item_id ? itemMap[shield.item_id] : null;
                                const atLimit = loadoutShields.length >= 10;
                                return (
                                  <button
                                    key={shield.id}
                                    type="button"
                                    onClick={() => {
                                      setLoadoutShields((prev) => {
                                        if (atLimit && !prev.includes(shield.id)) return prev;
                                        if (prev.includes(shield.id)) {
                                          setShieldId(shield.id);
                                          return prev;
                                        }
                                        const next = [...prev, shield.id];
                                        setShieldId(shield.id);
                                        return next;
                                      });
                                    }}
                                    style={{
                                      ...styles.loadoutCard,
                                      ...(isSelected ? styles.loadoutCardActive : null),
                                      opacity: !isSelected && atLimit ? 0.6 : 1,
                                    }}
                                  >
                                    <div style={styles.loadoutImageWrap}>
                                      {item?.image_url ? (
                                        <img
                                          src={item.image_url}
                                          alt={shield.name}
                                          width={80}
                                          height={80}
                                          style={{ width: 80, height: 80, objectFit: "contain" }}
                                        />
                                      ) : (
                                        <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                                      )}
                                    </div>
                                    <div style={styles.loadoutLabel}>{shield.name}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={styles.button}
                    onClick={battleWinner ? openResults : resolveBattle}
                    disabled={resolving}
                  >
                    {battleWinner ? "View results" : resolving ? "Resolving..." : "Take turn"}
                  </button>
                </>
              )}
            </>
          )}

          {result ? (
            <div
              style={{
                marginTop: 16,
                borderRadius: 16,
                border: "1px solid rgba(120, 90, 60, 0.25)",
                background: "rgba(255, 245, 228, 0.95)",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "rgba(120, 90, 60, 0.7)" }}>
                Turn outcome
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(83, 46, 20, 0.92)" }}>
                  You dealt {result.user_damage}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(83, 46, 20, 0.72)" }}>
                  You took {result.enemy_damage}
                </div>
              </div>
              <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={styles.label}>Your effects</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={styles.label}>Weapon impact</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={styles.loadoutImageWrap}>
                          {selectedWeaponItem?.image_url ? (
                            <img
                              src={selectedWeaponItem.image_url}
                              alt={selectedWeapon?.name ?? "Weapon"}
                              width={80}
                              height={80}
                              style={{ width: 80, height: 80, objectFit: "contain" }}
                            />
                          ) : (
                            <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                          )}
                        </div>
                        <div style={styles.loadoutLabel}>{selectedWeapon?.name ?? "Weapon"}</div>
                      </div>
                      {renderIconSprites(selectedWeapon?.attack_icons ?? null, "attack")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={styles.label}>Shield impact</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={styles.loadoutImageWrap}>
                          {selectedShieldItem?.image_url ? (
                            <img
                              src={selectedShieldItem.image_url}
                              alt={selectedShield?.name ?? "Shield"}
                              width={80}
                              height={80}
                              style={{ width: 80, height: 80, objectFit: "contain" }}
                            />
                          ) : (
                            <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                          )}
                        </div>
                        <div style={styles.loadoutLabel}>{selectedShield?.name ?? "Shield"}</div>
                      </div>
                      {renderIconSprites(selectedShield?.block_icons ?? null, "block")}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "right", alignItems: "flex-end" }}>
                  <div style={styles.label}>Opponent effects</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <div style={styles.label}>Weapon impact</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={styles.loadoutLabel}>{opponentWeapon?.name ?? "Weapon"}</div>
                        <div style={styles.loadoutImageWrap}>
                      {opponentWeaponImage ? (
                        <img
                          src={opponentWeaponImage}
                          alt={opponentWeapon?.name ?? "Weapon"}
                          width={80}
                          height={80}
                          style={{ width: 80, height: 80, objectFit: "contain" }}
                            />
                          ) : (
                            <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                          )}
                        </div>
                      </div>
                      {renderIconSprites(opponentWeapon?.attack_icons ?? null, "attack", "right")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <div style={styles.label}>Shield impact</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={styles.loadoutLabel}>{opponentShield?.name ?? "Shield"}</div>
                        <div style={styles.loadoutImageWrap}>
                      {opponentShieldImage ? (
                        <img
                          src={opponentShieldImage}
                          alt={opponentShield?.name ?? "Shield"}
                          width={80}
                          height={80}
                          style={{ width: 80, height: 80, objectFit: "contain" }}
                            />
                          ) : (
                            <div style={{ width: 60, height: 60, borderRadius: 12, background: "rgba(0,0,0,0.05)" }} />
                          )}
                        </div>
                      </div>
                      {renderIconSprites(opponentShield?.block_icons ?? null, "block", "right")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
