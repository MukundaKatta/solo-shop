import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupRequired } from "@/components/setup-required";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return <SetupRequired what="Supabase" />;
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <TopBar />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            This store doesn&apos;t exist yet.
          </h1>
          <p className="mt-3 text-neutral-600">
            The handle{" "}
            <span className="font-mono text-neutral-900">{slug}</span> is
            available.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-full bg-neutral-900 px-6 py-3 font-medium text-white hover:bg-neutral-700"
          >
            Claim it →
          </Link>
        </div>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <TopBar />
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-2xl font-bold text-white">
          {store.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">{store.name}</h1>
        {store.bio ? (
          <p className="mx-auto mt-2 max-w-xl text-neutral-600">{store.bio}</p>
        ) : null}
        <p className="mt-3 font-mono text-xs text-neutral-400">
          solo.shop/s/{store.slug}
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {!products || products.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-16 text-center text-neutral-500">
            No products yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/s/${store.slug}/${p.id}`}
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 transition hover:border-neutral-400"
                >
                  {p.image_url ? (
                    <div
                      className="aspect-square w-full bg-neutral-100 bg-cover bg-center transition group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url(${p.image_url})` }}
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                      No image
                    </div>
                  )}
                  <div className="flex items-baseline justify-between p-4">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="shrink-0 text-sm text-neutral-600">
                      {formatPrice(p.price_cents)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <nav className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          solo<span className="text-orange-500">.</span>shop
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium hover:opacity-70"
        >
          Open your own store →
        </Link>
      </div>
    </nav>
  );
}
