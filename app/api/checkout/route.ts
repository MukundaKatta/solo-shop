import { NextResponse } from "next/server";
import { createClient, createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase isn't configured yet." },
      { status: 503 },
    );
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const productId = body?.productId;
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price_cents, image_url, store_id")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("id", product.store_id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(product.description ? { description: product.description } : {}),
            ...(product.image_url ? { images: [product.image_url] } : {}),
          },
          unit_amount: product.price_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/s/${store.slug}/${product.id}`,
  });

  // Pre-record the pending order via service client (bypasses RLS).
  try {
    const service = createServiceClient();
    await service.from("orders").insert({
      product_id: product.id,
      store_id: product.store_id,
      amount_cents: product.price_cents,
      stripe_session_id: session.id,
      status: "pending",
    });
  } catch {
    // Non-fatal; webhook will still record the final state.
  }

  return NextResponse.json({ url: session.url });
}
