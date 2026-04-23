"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { addProduct, removeProduct, saveProfile } from "./actions";
import { formatPrice, slugify } from "@/lib/format";

type Store = {
  id: string;
  slug: string;
  name: string;
  bio: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
};

export function DashboardUI({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  const storeUrl = `/s/${store.slug}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-neutral-600">
        Your store lives at{" "}
        <Link href={storeUrl} className="font-medium text-orange-600 hover:underline">
          solo.shop{storeUrl}
        </Link>
        .
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold">Your profile</h2>
          <ProfileForm store={store} />
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold">Add a product</h2>
          <AddProductForm />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Your products ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            No products yet. Add your first one above.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200">
      {product.image_url ? (
        <div
          className="aspect-square w-full bg-neutral-100 bg-cover bg-center"
          style={{ backgroundImage: `url(${product.image_url})` }}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          No image
        </div>
      )}
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{product.name}</p>
          <p className="mt-0.5 text-sm text-neutral-500">
            {formatPrice(product.price_cents)}
          </p>
        </div>
        <button
          onClick={() =>
            startTransition(async () => {
              await removeProduct(product.id);
            })
          }
          disabled={isPending}
          className="text-xs text-neutral-500 hover:text-red-600 disabled:opacity-50"
        >
          {isPending ? "Removing…" : "Remove"}
        </button>
      </div>
    </li>
  );
}

function ProfileForm({ store }: { store: Store }) {
  const [slug, setSlug] = useState(store.slug);
  const [name, setName] = useState(store.name);
  const [bio, setBio] = useState(store.bio);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSlug(store.slug);
    setName(store.name);
    setBio(store.bio);
  }, [store.slug, store.name, store.bio]);

  return (
    <form
      className="mt-4 flex flex-col gap-3"
      action={(formData) =>
        startTransition(async () => {
          formData.set("slug", slug);
          const result = await saveProfile(formData);
          setMessage(result?.error ? result.error : "Saved.");
          setTimeout(() => setMessage(null), 2500);
        })
      }
    >
      <Field label="Store name">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="My Store"
        />
      </Field>
      <Field label="URL handle" hint={`solo.shop/s/${slug || "…"}`}>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="input"
          placeholder="my-store"
        />
      </Field>
      <Field label="Bio">
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input min-h-[80px]"
          placeholder="A sentence about what you sell."
        />
      </Field>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save profile"}
        </button>
        {message ? (
          <span className="text-sm text-neutral-500">{message}</span>
        ) : null}
      </div>
    </form>
  );
}

function AddProductForm() {
  const [isPending, startTransition] = useTransition();
  const [key, setKey] = useState(0);

  return (
    <form
      key={key}
      className="mt-4 flex flex-col gap-3"
      action={(formData) =>
        startTransition(async () => {
          const result = await addProduct(formData);
          if (!result?.error) {
            setKey((k) => k + 1);
          }
        })
      }
    >
      <Field label="Product name">
        <input
          name="name"
          className="input"
          placeholder="Moon mug"
          required
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          className="input min-h-[70px]"
          placeholder="What makes it special?"
        />
      </Field>
      <div className="grid grid-cols-[1fr_1.7fr] gap-3">
        <Field label="Price (USD)">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="38.00"
            required
          />
        </Field>
        <Field label="Image URL">
          <input
            name="imageUrl"
            className="input"
            placeholder="https://…"
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add product"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-800">{label}</span>
      {children}
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}
