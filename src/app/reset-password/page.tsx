"use client";

/**
 * src/app/reset-password/page.tsx
 * User lands here from the email link → sets a new password.
 */

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") || "";
  const email        = searchParams.get("email") || "";

  const [password, setPassword]       = useState("");
  const [confirm,  setConfirm]        = useState("");
  const [showPwd,  setShowPwd]        = useState(false);
  const [status,   setStatus]         = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message,  setMessage]        = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");

    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  // Guard: missing token or email in URL
  if (!token || !email) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Invalid reset link
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          This link is missing required parameters.{" "}
          <Link href="/forgot-password" className="text-blue-400 hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Success */}
      {status === "success" ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Password updated!
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {message} Redirecting to sign in…
            </p>
          </div>
        </div>
      ) : (
        <>
          {status === "error" && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                New password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2 pr-10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  style={{
                    backgroundColor: "var(--bg-hover)",
                    border:          "1px solid var(--border)",
                    color:           "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Confirm new password
              </label>
              <input
                type={showPwd ? "text" : "password"}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  border:          "1px solid var(--border)",
                  color:           "var(--text-primary)",
                }}
              />
            </div>

            {/* Strength hint */}
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[8, 10, 12].map(len => (
                    <div
                      key={len}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          password.length >= len ? "#2563eb" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {password.length < 8
                    ? "Too short"
                    : password.length < 10
                    ? "Weak — add more characters"
                    : password.length < 12
                    ? "Medium — good, but could be stronger"
                    : "Strong password ✓"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span>{status === "loading" ? "Updating…" : "Set New Password"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </>
      )}

      <div
        className="mt-5 pt-4 border-t text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <Link href="/login" className="font-semibold text-blue-400 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/20">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Set a new password
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Choose a strong password to protect your account.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 shadow-xl"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <Suspense fallback={<p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
