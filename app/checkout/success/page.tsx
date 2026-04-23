import Link from "next/link";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          solo<span className="text-orange-500">.</span>shop
        </Link>
      </nav>
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">
          Payment received.
        </h1>
        <p className="mt-3 text-neutral-600">
          Thanks for your order. The seller will be in touch by email to arrange
          delivery.
        </p>
        {session_id ? (
          <p className="mt-8 font-mono text-xs text-neutral-400">
            Order ref: {session_id}
          </p>
        ) : null}
      </main>
    </div>
  );
}
