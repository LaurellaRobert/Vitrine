"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");

  async function signUp() {
    setStatus("Signing up...");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setStatus(error.message);
    setStatus("Signed up. If email confirmation is enabled, check your inbox. Otherwise, sign in.");
  }

  async function signIn() {
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setStatus(error.message);
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

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={signUp} style={{ padding: "8px 12px" }}>Sign up</button>
        <button onClick={signIn} style={{ padding: "8px 12px" }}>Sign in</button>
      </div>

      <p style={{ marginTop: 14 }}>{status}</p>
    </main>
  );
}
