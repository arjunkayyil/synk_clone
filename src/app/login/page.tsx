"use client";

/**
 * src/app/login/page.tsx
 * Login screen with dark/light theme support and credentials sign-in.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("arjunkayyil@gmail.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
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
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Sign in to Synk
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Welcome back! Enter your details to continue.
          </p>
        </div>

        {/* Card */}
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
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                    Forgot?
                  </Link>
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
              <span>{loading ? "Signing in…" : "Sign In"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-400 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
