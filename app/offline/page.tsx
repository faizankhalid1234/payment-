import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="card-panel max-w-md p-8 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-brand">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black">You are offline</h1>
        <p className="mt-3 text-muted">
          Your payment ledger will sync again when you reconnect. Saved pages may still open.
        </p>
        <Link href="/" className="btn-brand mt-6">
          Try Dashboard
        </Link>
      </section>
    </main>
  );
}
