"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          solo<span className="text-orange-500">.</span>shop
        </Link>
      </nav>

      <main className="mx-auto flex max-w-md flex-col px-6 pt-16">
        <h1 className="text-3xl font-bold tracking-tight">Log in or sign up</h1>
        <p className="mt-2 text-neutral-600">
          We&apos;ll email you a magic link. No password needed.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
            <p className="font-medium">Check your email.</p>
            <p className="mt-1 text-sm">
              We sent a link to <span className="font-mono">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </form>
        )}

        <p className="mt-8 text-xs text-neutral-400">
          By continuing you agree to nothing — there are no terms yet.
        </p>
      </main>
    </div>
  );
}
