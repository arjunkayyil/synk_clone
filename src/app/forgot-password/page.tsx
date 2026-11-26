"use client";

/**
 * src/app/forgot-password/page.tsx
 * Enter email → receive reset link in inbox.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setStatus("success");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
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
            Forgot your password?
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 shadow-xl"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {/* Success state */}
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Check your inbox
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {message}
                </p>
              </div>
              <div
                className="w-full flex items-center gap-2 p-3 rounded-lg text-xs"
                style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}
              >
                <Mail size={14} className="shrink-0 text-blue-400" />
                <span>
                  Sent to <strong style={{ color: "var(--text-secondary)" }}>{email}</strong>. The link
                  expires in 1 hour.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {status === "error" && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
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
                      border:          "1px solid var(--border)",
                      color:           "var(--text-primary)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <span>{status === "loading" ? "Sending…" : "Send Reset Link"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </>
          )}

          <div
            className="mt-5 pt-4 border-t text-center text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
