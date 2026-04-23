import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupRequired } from "@/components/setup-required";
import { DashboardUI } from "./dashboard-ui";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

function slugFromEmail(email: string | undefined, userId: string): string {
  const prefix = (email ?? "").split("@")[0] ?? "";
  const cleaned = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  return cleaned || `user-${userId.slice(0, 6)}`;
}

async function ensureUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
): Promise<string> {
  let slug = base;
  let suffix = 0;
  while (true) {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
    if (suffix > 50) return `${base}-${Date.now()}`;
  }
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <SetupRequired what="Supabase" />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    const baseSlug = slugFromEmail(user.email, user.id);
    const slug = await ensureUniqueSlug(supabase, baseSlug);
    const { data: created, error } = await supabase
      .from("stores")
      .insert({
        owner_id: user.id,
        slug,
        name: "My Store",
        bio: "",
      })
      .select()
      .single();
    if (error || !created) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Couldn&apos;t create your store</h1>
          <p className="mt-2 text-red-600">{error?.message ?? "Unknown error"}</p>
          <p className="mt-4 text-sm text-neutral-500">
            Did you run the SQL schema in Supabase?
          </p>
        </div>
      );
    }
    store = created;
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            solo<span className="text-orange-500">.</span>shop
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-500">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-neutral-500 hover:text-neutral-900"
              >
                Sign out
              </button>
            </form>
            <Link
              href={`/s/${store.slug}`}
              className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
            >
              View my store →
            </Link>
          </div>
        </div>
      </nav>

      <DashboardUI store={store} products={products ?? []} />
    </div>
  );
}
