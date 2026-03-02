"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioLogo } from "@/components/StudioLogo";
import { createClient } from "@/lib/supabase/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || searchParams.get("next") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const useSupabase =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLED === "true" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useSupabase || !email.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}${basePath}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: callbackUrl },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setMessage("Check your email for the sign-in link.");
      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useSupabase || !email.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setMessage("Check your email for the 6-digit code.");
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useSupabase || !otpToken.trim()) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpToken.trim(),
        type: "email",
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Invalid or expired code. Please try again.");
    }
    setLoading(false);
  };

  // Legacy password auth when Supabase is not configured
  const [password, setPassword] = useState("");
  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  if (!useSupabase) {
    return (
      <main className="min-h-screen bg-[#F8F5EE] text-neutral-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <StudioLogo className="text-black/70" />
            </div>
            <p className="text-sm text-black/70 leading-relaxed">
              Please enter your project password to access the design portal.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
            <form onSubmit={handleLegacySubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full px-5 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying…" : "Access Site"}
              </button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-xs text-black/40">Secure access for Studio clients.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5EE] text-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <StudioLogo className="text-black/70" />
          </div>
          <p className="text-sm text-black/70 leading-relaxed">
            Sign in with your email. We’ll send you a link or a one-time code—no password needed.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
          {errorParam === "auth" && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
              Sign-in link may have expired. Request a new one below.
            </div>
          )}

          {step === "email" && (
            <>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs text-center">
                    {error}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={loading || !email.trim()}
                    className="flex-1 flex justify-center py-3 px-4 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending…" : "Send magic link"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !email.trim()}
                    className="flex-1 flex justify-center py-3 px-4 rounded-full border border-black/20 bg-transparent text-black text-sm font-medium hover:bg-black/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send one-time code
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-black/70">{message}</p>
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
                >
                  6-digit code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-5 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-center text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all sm:text-sm"
                  placeholder="000000"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs text-center">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setOtpToken(""); }}
                  className="flex-1 py-3 px-4 rounded-full border border-black/20 bg-transparent text-sm font-medium hover:bg-black/5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpToken.length !== 6}
                  className="flex-1 py-3 px-4 rounded-full bg-black text-[#F8F5EE] text-sm font-medium hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-black/80">{message}</p>
              <p className="text-xs text-black/50">
                Click the link in that email to sign in. You can close this tab.
              </p>
              <button
                type="button"
                onClick={() => { setStep("email"); setMessage(""); }}
                className="text-sm font-medium text-black/70 hover:text-black underline"
              >
                Use a different email or send a code instead
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-black/40">Secure access for Studio clients.</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F5EE] text-neutral-900 flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <StudioLogo className="text-black/70" />
            </div>
            <p className="text-sm text-black/70 leading-relaxed">Loading…</p>
          </div>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
