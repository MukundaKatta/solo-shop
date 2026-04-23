import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          solo<span className="text-orange-500">.</span>shop
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:opacity-70">
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center sm:pt-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-500">
          Zero fees. Ever.
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Start selling with a single photo.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl">
          Upload a photo of your product, skill, or service. Your storefront,
          checkout, and customers — ready in sixty seconds.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-full bg-neutral-900 px-7 py-3.5 font-medium text-white hover:bg-neutral-700"
          >
            Start your store — free
          </Link>
          <Link
            href="/s/demo"
            className="rounded-full border border-neutral-300 px-7 py-3.5 font-medium hover:bg-neutral-50"
          >
            See a demo store →
          </Link>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            title="Zero fees"
            body="We don't take a cut of your sales. Not now, not ever."
          />
          <Feature
            title="One-photo setup"
            body="Snap a photo. We build the page, the checkout, and the ads."
          />
          <Feature
            title="Own your customers"
            body="Build a community you control. Message, invite, sell again."
          />
          <Feature
            title="Global payments"
            body="Accept payments from anywhere in the world. 0% platform fees."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Don&apos;t rent space on someone else&apos;s marketplace.
          <br />
          <span className="text-orange-500">Own your store.</span>
        </h2>
        <Link
          href="/dashboard"
          className="mt-10 inline-block rounded-full bg-neutral-900 px-7 py-3.5 font-medium text-white hover:bg-neutral-700"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-neutral-500">
          <p>
            solo<span className="text-orange-500">.</span>shop
          </p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-neutral-600">{body}</p>
    </div>
  );
}
