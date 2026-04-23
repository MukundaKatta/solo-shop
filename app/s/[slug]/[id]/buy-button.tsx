"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

export function BuyButton({
  productId,
  priceCents,
}: {
  productId: string;
  priceCents: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={buy}
        disabled={loading}
        className="w-full rounded-full bg-neutral-900 px-6 py-4 text-base font-medium text-white hover:bg-neutral-700 disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Redirecting…" : `Buy for ${formatPrice(priceCents)}`}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
