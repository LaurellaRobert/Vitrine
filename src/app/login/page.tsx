"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string>("");

  async function upsertDisplayName(userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus("Please enter a display name to continue.");
      return false;
    }

    const profileRes = await supabase
      .from("profiles")
      .upsert({ id: userId, display_name: trimmed }, { onConflict: "id" });

    if (profileRes.error) {
      setStatus(profileRes.error.message);
      return false;
    }

    return true;
  }

  async function signUp() {
    if (!displayName.trim()) {
      setStatus("Please enter a display name.");
      return;
    }
    setStatus("Signing up...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) return setStatus(error.message);
    if (data.user?.id) {
      await upsertDisplayName(data.user.id, displayName);
    }
    setStatus("Signed up. If email confirmation is enabled, check your inbox. Otherwise, sign in.");
  }

  async function signIn() {
    setStatus("Signing in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setStatus(error.message);

    const userId = data.user?.id;
    if (userId) {
      const profileRes = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (!profileRes.error && !profileRes.data?.display_name) {
        const updated = await upsertDisplayName(userId, displayName);
        if (!updated) return;
      }
    }

    setStatus("Signed in.");
    router.push("/library");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Login</h1>

      <label>Email</label>
      <input
        style={{ width: "100%", padding: 8, margin: "6px 0 14px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <label>Password</label>
      <input
        style={{ width: "100%", padding: 8, margin: "6px 0 18px" }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="••••••••"
      />

      <label>Display name</label>
      <input
        style={{ width: "100%", padding: 8, margin: "6px 0 18px" }}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={signUp} style={{ padding: "8px 12px" }}>Sign up</button>
        <button onClick={signIn} style={{ padding: "8px 12px" }}>Sign in</button>
      </div>

      <p style={{ marginTop: 14 }}>{status}</p>
    </main>
  );
}
