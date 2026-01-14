"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primaryItems = [
  { href: "/collection", label: "Collection" },
];

const battleItems = [
  { href: "/battle", label: "Arena" },
  { href: "/battle/opponents", label: "Opponents" },
  { href: "/battle/highscores", label: "High Scores" },
];

const locationItems = [
  { href: "/library", label: "Library" },
  { href: "/museum", label: "Museum" },
  { href: "/cafe", label: "Cafe" },
  { href: "/castle", label: "Castle" },
  { href: "/garden", label: "Garden" },
  { href: "/great_hall", label: "Great Hall" },
];

const activityItems = [
  { href: "/fountain", label: "Fountain" },
  { href: "/well", label: "Well" },
  { href: "/sanctum", label: "Sanctum" },
];

const shopItems = [{ href: "/shops/inn", label: "Inn" }];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isAnyExploreActive(pathname: string) {
  return [...locationItems, ...activityItems].some((x) => isActivePath(pathname, x.href));
}

function isAnyShopActive(pathname: string) {
  return shopItems.some((x) => isActivePath(pathname, x.href));
}

export default function Navbar() {
  const pathname = usePathname();

  const [exploreOpen, setExploreOpen] = useState(false);
  const [shopsOpen, setShopsOpen] = useState(false);
  const [battleOpen, setBattleOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const shopsRef = useRef<HTMLDivElement | null>(null);
  const battleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setExploreOpen(false);
    setShopsOpen(false);
    setBattleOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setExploreOpen(false);
      }

      if (battleRef.current && !battleRef.current.contains(target)) {
        setBattleOpen(false);
      }

      if (shopsRef.current && !shopsRef.current.contains(target)) {
        setShopsOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setExploreOpen(false);
        setBattleOpen(false);
        setShopsOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  const exploreActive = isAnyExploreActive(pathname);
  const battleActive = battleItems.some((item) => isActivePath(pathname, item.href));
  const navFont = "system-ui";
  const itemBase = {
    textDecoration: "none",
    color: "rgba(72, 42, 18, 0.92)",
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(120, 78, 40, 0.4)",
    background: "rgba(255, 250, 242, 1)",
    letterSpacing: 0.2,
    textShadow: "none",
    position: "relative",
    zIndex: 1,
  } as const;
  const itemActive = {
    border: "1px solid rgba(156, 108, 62, 0.7)",
    background: "rgba(255, 235, 206, 1)",
    fontWeight: 600,
  } as const;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(62, 38, 24, 0.98)",
        borderBottom: "1px solid rgba(35, 22, 13, 0.8)",
        boxShadow: "none",
      }}
    >
      <nav
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: navFont,
          position: "relative",
          color: "rgba(255, 245, 231, 0.9)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 10,
            textDecoration: "none",
            position: "relative",
            zIndex: 1,
            width: 260,
            flex: "0 0 260px",
          }}
        >
          <Image
            src="https://droohxprbrxprrqcfqha.supabase.co/storage/v1/object/public/vitrine-assets/visual/vitrine_brandmark.png"
            alt="Vitrine"
            width={190}
            height={100}
            style={{ width: "auto", height: "auto", display: "block" }}
          />
        </Link>

        {primaryItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...itemBase,
                ...(active ? itemActive : null),
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <div ref={battleRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setBattleOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={battleOpen}
            style={{
              ...itemBase,
              ...(battleActive ? itemActive : null),
              cursor: "pointer",
              fontWeight: battleActive ? 600 : 400,
            }}
          >
            Battle ▾
          </button>

          {battleOpen ? (
            <div
              role="menu"
              aria-label="Battle"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: 200,
                background: "rgba(255, 250, 242, 1)",
                border: "1px solid rgba(120, 78, 40, 0.4)",
                borderRadius: 14,
                boxShadow: "0 10px 26px rgba(22, 14, 8, 0.35)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 2,
              }}
            >
              {battleItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "rgba(72, 42, 18, 0.92)",
                      background: active ? "rgba(255, 236, 210, 1)" : "rgba(255, 248, 236, 1)",
                      border: "1px solid rgba(120, 78, 40, 0.35)",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <span style={{ fontSize: 13, letterSpacing: 0.3 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setExploreOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={exploreOpen}
            style={{
              ...itemBase,
              ...(exploreActive ? itemActive : null),
              cursor: "pointer",
              fontWeight: exploreActive ? 600 : 400,
            }}
          >
            Explore ▾
          </button>

          {exploreOpen ? (
            <div
              role="menu"
              aria-label="Explore"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: 360,
                background: "rgba(255, 250, 242, 1)",
                border: "1px solid rgba(120, 78, 40, 0.4)",
                borderRadius: 14,
                boxShadow: "0 10px 26px rgba(22, 14, 8, 0.35)",
                padding: 16,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(160px, 1fr))",
                gap: 12,
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: "rgba(120, 90, 60, 0.7)",
                  }}
                >
                  Locations
                </div>
                {locationItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      style={{
                        display: "block",
                        padding: "12px 14px",
                        borderRadius: 14,
                        textDecoration: "none",
                        color: "rgba(72, 42, 18, 0.92)",
                        background: active ? "rgba(255, 236, 210, 1)" : "rgba(255, 248, 236, 1)",
                        border: "1px solid rgba(120, 78, 40, 0.35)",
                        fontWeight: active ? 600 : 500,
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 14, letterSpacing: 0.4 }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: "rgba(120, 90, 60, 0.7)",
                  }}
                >
                  Activities
                </div>
                {activityItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      style={{
                        display: "block",
                        padding: "12px 14px",
                        borderRadius: 14,
                        textDecoration: "none",
                        color: "rgba(72, 42, 18, 0.92)",
                        background: active ? "rgba(255, 236, 210, 1)" : "rgba(255, 248, 236, 1)",
                        border: "1px solid rgba(120, 78, 40, 0.35)",
                        fontWeight: active ? 600 : 500,
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 14, letterSpacing: 0.4 }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={shopsRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShopsOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={shopsOpen}
            style={{
              ...itemBase,
              ...(isAnyShopActive(pathname) ? itemActive : null),
              cursor: "pointer",
              fontWeight: isAnyShopActive(pathname) ? 600 : 400,
            }}
          >
            Shops ▾
          </button>

          {shopsOpen ? (
            <div
              role="menu"
              aria-label="Shops"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: 200,
                background: "rgba(255, 250, 242, 1)",
                border: "1px solid rgba(120, 78, 40, 0.4)",
                borderRadius: 14,
                boxShadow: "0 10px 26px rgba(22, 14, 8, 0.35)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 2,
              }}
            >
              {shopItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "rgba(72, 42, 18, 0.92)",
                      background: active ? "rgba(255, 236, 210, 1)" : "rgba(255, 248, 236, 1)",
                      border: "1px solid rgba(120, 78, 40, 0.35)",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <span style={{ fontSize: 13, letterSpacing: 0.3 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
