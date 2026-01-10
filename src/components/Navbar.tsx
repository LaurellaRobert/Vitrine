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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setIsAuthed(!!user);
      if (user?.id) {
        const profileRes = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .limit(1);
        const profileRow = profileRes.data?.[0];
        if (!profileRes.error && profileRow?.display_name) {
          setDisplayName(profileRow.display_name);
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setIsAuthed(!!user);
      if (user?.id) {
        const profileRes = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .limit(1);
        const profileRow = profileRes.data?.[0];
        if (!profileRes.error && profileRow?.display_name) {
          setDisplayName(profileRow.display_name);
        }
      } else {
        setDisplayName("");
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    setExploreOpen(false);
    setMenuOpen(false);
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

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setExploreOpen(false);
        setMenuOpen(false);
      }
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
    color: "rgba(72, 42, 18, 0.92)",
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(120, 78, 40, 0.45)",
    background: "rgba(255, 248, 236, 1)",
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
        backdropFilter: "blur(10px)",
        background:
          "linear-gradient(180deg, rgba(129, 78, 41, 0.96), rgba(92, 54, 28, 0.98))",
        borderBottom: "1px solid rgba(52, 30, 14, 0.65)",
        boxShadow: "0 18px 40px rgba(52, 30, 14, 0.25)",
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
          color: "rgba(255, 248, 237, 0.92)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: 18,
            border: "1px solid rgba(255, 222, 166, 0.24)",
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, rgba(0,0,0,0.16) 3px, rgba(0,0,0,0.16) 8px)," +
              "repeating-linear-gradient(12deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 9px)," +
              "linear-gradient(180deg, rgba(255, 235, 205, 0.18), rgba(0,0,0,0.05))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            opacity: 0.85,
            zIndex: 0,
          }}
        />

        <Link
          href="/"
          style={{
            fontWeight: 700,
            marginRight: 10,
            letterSpacing: 0.6,
            textDecoration: "none",
            color: "rgba(255, 242, 224, 0.98)",
            fontSize: 18,
            fontFamily: brandFont,
            position: "relative",
            zIndex: 1,
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
                background:
                  "linear-gradient(180deg, rgba(129, 78, 41, 0.98), rgba(92, 54, 28, 0.98))",
                border: "1px solid rgba(52, 30, 14, 0.6)",
                borderRadius: 14,
                boxShadow: "0 16px 40px rgba(52, 30, 14, 0.4)",
                padding: 10,
                minWidth: 210,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 2,
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
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{
                  ...itemBase,
                  border: "1px solid rgba(156, 108, 62, 0.7)",
                  background: "rgba(255, 235, 206, 1)",
                  cursor: "pointer",
                }}
              >
                Menu ▾
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  aria-label="User menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: 160,
                    background:
                      "linear-gradient(180deg, rgba(129, 78, 41, 0.98), rgba(92, 54, 28, 0.98))",
                    border: "1px solid rgba(52, 30, 14, 0.6)",
                    borderRadius: 14,
                    boxShadow: "0 16px 40px rgba(52, 30, 14, 0.4)",
                    padding: 6,
                    zIndex: 2,
                  }}
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    style={{
                      display: "block",
                      padding: "8px 10px",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: "rgba(72, 42, 18, 0.92)",
                      background: "rgba(255, 248, 236, 1)",
                      border: "1px solid rgba(120, 78, 40, 0.35)",
                      fontWeight: 500,
                    }}
                  >
                    Edit profile
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    role="menuitem"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      marginTop: 6,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(120, 78, 40, 0.35)",
                      background: "rgba(255, 248, 236, 1)",
                      color: "rgba(72, 42, 18, 0.92)",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {isAuthed && displayName ? (
          <Link
            href={`/u/${encodeURIComponent(displayName)}`}
            style={{
              ...itemBase,
              border: "1px solid rgba(156, 108, 62, 0.7)",
              background: "rgba(255, 235, 206, 1)",
              fontWeight: 600,
            }}
          >
            {displayName}
          </Link>
        ) : null}

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
              border: "1px solid rgba(255, 222, 166, 0.5)",
              background: "rgba(255, 235, 206, 1)",
              color: "rgba(72, 42, 18, 0.92)",
              fontSize: 14,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
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
                  background: "rgba(255, 214, 130, 0.95)",
                  color: "rgba(92, 45, 12, 0.95)",
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
                border: "1px solid rgba(255, 222, 166, 0.5)",
                background: "rgba(82, 47, 24, 0.98)",
                color: "rgba(255, 242, 224, 0.9)",
                fontSize: 12,
                lineHeight: 1.4,
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
