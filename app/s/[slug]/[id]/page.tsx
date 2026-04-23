import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupRequired } from "@/components/setup-required";
import { formatPrice } from "@/lib/format";
import { BuyButton } from "./buy-button";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  if (!isSupabaseConfigured()) {
    return <SetupRequired what="Supabase" />;
  }

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, stores!inner(id, slug, name)")
    .eq("id", id)
    .maybeSingle();

  if (!product || product.stores.slug !== slug) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <TopBar />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Product not found.
          </h1>
          <Link
            href={`/s/${slug}`}
            className="mt-6 inline-block text-sm text-orange-600 hover:underline"
          >
            ← Back to the store
          </Link>
        </div>
      </div>
    );
  }

  const store = product.stores as { id: string; slug: string; name: string };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <TopBar />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          {product.image_url ? (
            <div
              className="aspect-square w-full rounded-2xl bg-neutral-100 bg-cover bg-center"
              style={{ backgroundImage: `url(${product.image_url})` }}
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <Link
            href={`/s/${slug}`}
            className="text-sm text-neutral-500 hover:underline"
          >
            ← {store.name}
          </Link>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-medium">
            {formatPrice(product.price_cents)}
          </p>
          {product.description ? (
            <p className="mt-6 leading-relaxed text-neutral-700">
              {product.description}
            </p>
          ) : null}

          <div className="mt-8">
            <BuyButton productId={product.id} priceCents={product.price_cents} />
            <p className="mt-3 text-xs text-neutral-500">
              Secure checkout • 0% platform fees
            </p>
          </div>
        </div>
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
