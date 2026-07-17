import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70 bg-surface/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <div>
            <p className="text-sm font-bold">Payment Ledger</p>
            <p className="text-xs text-muted">Track income & expenses easily</p>
          </div>
        </div>
        <p className="text-center text-xs text-muted sm:text-right">
          © {year} Payment Ledger. Secure • Private • Simple
        </p>
      </div>
    </footer>
  );
}
