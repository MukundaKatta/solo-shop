"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slugRaw = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "My Store";
  const bio = String(formData.get("bio") ?? "").trim();
  const slug = slugify(slugRaw) || `user-${user.id.slice(0, 6)}`;

  const { error } = await supabase
    .from("stores")
    .update({ slug, name, bio })
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/s/${slug}`);
  return { ok: true };
}

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required" };

  const description = String(formData.get("description") ?? "").trim();
  const priceStr = String(formData.get("price") ?? "0");
  const priceCents = Math.max(0, Math.round(parseFloat(priceStr) * 100));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const { data: store } = await supabase
    .from("stores")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

  if (!store) return { error: "Store not found" };

  const { error } = await supabase.from("products").insert({
    store_id: store.id,
    name,
    description,
    price_cents: Number.isFinite(priceCents) ? priceCents : 0,
    image_url: imageUrl,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/s/${store.slug}`);
  return { ok: true };
}

export async function removeProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("owner_id", user.id)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  if (store) revalidatePath(`/s/${store.slug}`);
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
