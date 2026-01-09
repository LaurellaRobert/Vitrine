"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { dismissNotification, getNotifications, subscribeNotifications, type NotificationItem } from "@/lib/notifications";

const primaryItems = [
  { href: "/collection", label: "Collection" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const exploreItems = [
  { href: "/library", label: "Library" },
  { href: "/museum", label: "Museum" },
  { href: "/cafe", label: "Cafe" },
  { href: "/castle", label: "Castle" },
  { href: "/garden", label: "Garden" },
  { href: "/great_hall", label: "Great Hall"},
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isAnyExploreActive(pathname: string) {
  return exploreItems.some((x) => isActivePath(pathname, x.href));
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthed, setIsAuthed] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthed(!!data.user);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    setExploreOpen(false);
  }, [pathname]);

  useEffect(() => {
    setNotifications(getNotifications());
    return subscribeNotifications(setNotifications);
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setExploreOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExploreOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const exploreActive = isAnyExploreActive(pathname);
  const navFont = "system-ui";
  const brandFont = "\"Iowan Old Style\", \"Georgia\", \"Times New Roman\", serif";
  const itemBase = {
    textDecoration: "none",
    color: "inherit",
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    letterSpacing: 0.2,
  } as const;
  const itemActive = {
    border: "1px solid rgba(15, 23, 42, 0.2)",
    background: "rgba(15, 23, 42, 0.06)",
    fontWeight: 600,
  } as const;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.82))",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: navFont,
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 700,
            marginRight: 10,
            letterSpacing: 0.6,
            textDecoration: "none",
            color: "inherit",
            fontSize: 18,
            fontFamily: brandFont,
          }}
        >
          Vitrine
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
                minWidth: 180,
                background: "rgba(255, 255, 255, 0.98)",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                borderRadius: 14,
                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
                padding: 6,
              }}
            >
              {exploreItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    style={{
                      display: "block",
                      padding: "8px 10px",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "inherit",
                      background: active ? "rgba(15, 23, 42, 0.06)" : "transparent",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={{ marginLeft: "auto" }}>
          {!isAuthed ? (
            <Link
              href="/login"
              style={{
                ...itemBase,
                ...(isActivePath(pathname, "/login") ? itemActive : null),
              }}
            >
              Login
            </Link>
          ) : (
            <button
              onClick={signOut}
              style={{
                ...itemBase,
                border: "1px solid rgba(15, 23, 42, 0.18)",
                background: "rgba(15, 23, 42, 0.04)",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotifications((open) => !open)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 12,
              width: 30,
              height: 30,
              borderRadius: 999,
              border: "1px solid rgba(148, 116, 72, 0.35)",
              background: "rgba(255, 248, 237, 0.9)",
              color: "rgba(92, 45, 12, 0.85)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">✦</span>
            {notifications.length > 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 14,
                  height: 14,
                  padding: "0 4px",
                  borderRadius: 999,
                  background: "rgba(148, 116, 72, 0.9)",
                  color: "white",
                  fontSize: 10,
                  lineHeight: "14px",
                  textAlign: "center",
                }}
              >
                {notifications.length}
              </span>
            ) : null}
          </button>

          {showNotifications ? (
            <div
              role="status"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 240,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(148, 116, 72, 0.25)",
                background: "rgba(255, 248, 237, 0.96)",
                color: "rgba(92, 45, 12, 0.85)",
                fontSize: 12,
                lineHeight: 1.4,
                boxShadow: "0 12px 24px rgba(15, 23, 42, 0.12)",
              }}
            >
              {notifications.length === 0 ? (
                <div>Rare drops will appear here.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1 }}>{item.message}</div>
                      <button
                        type="button"
                        onClick={() => dismissNotification(item.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          fontSize: 12,
                          cursor: "pointer",
                          opacity: 0.6,
                        }}
                        aria-label="Dismiss notification"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
