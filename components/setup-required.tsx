import Link from "next/link";

export function SetupRequired({ what }: { what: string }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          solo<span className="text-orange-500">.</span>shop
        </Link>
      </nav>
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
          Setup needed
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          {what}
          {" "}
          isn&apos;t configured yet.
        </h1>
        <p className="mt-3 text-neutral-600">
          Follow the setup steps in <span className="font-mono">README.md</span>{" "}
          to connect {what} and turn this demo into a real store.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-orange-600 hover:underline"
        >
          ← Back home
        </Link>
      </main>
    </div>
  );
}
