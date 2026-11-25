"use client";

/**
 * src/app/register/page.tsx
 * User registration page creating account in SQLite via /api/register and logging in.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await regRes.json();

      if (!regRes.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const signinRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signinRes?.error) {
        router.push("/login");
      } else {
        router.push("/tasks");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Create your account
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Join your workspace on Synk
          </p>
        </div>

        <div
          className="rounded-2xl border p-6 shadow-xl"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Arjun Kayyil"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span>{loading ? "Creating account…" : "Sign Up"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
