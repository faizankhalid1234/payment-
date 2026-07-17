import Link from "next/link";
import { ExternalLink, Phone, Heart } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70 bg-surface/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Logo size={32} />
              <div>
                <p className="text-sm font-bold">Payment Ledger</p>
                <p className="text-xs text-muted">Income & expense tracker</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted">
              A simple and secure way to record payments, track balance, and manage your personal ledger.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-brand">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand">
                  Login / Register
                </Link>
              </li>
              <li>
                <Link href="/offline" className="hover:text-brand">
                  Offline Mode
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Features</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>Income & Expense entries</li>
              <li>Edit / Import / Export</li>
              <li>Date & time filters</li>
              <li>Private secure accounts</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Developer</h3>
            <p className="text-sm font-semibold text-fg">Developed by Faizan Khalid</p>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li>
                <a
                  href="tel:+923029655325"
                  className="inline-flex items-center gap-2 hover:text-brand"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  0302 9655325
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/faizan-khalid-developerp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-brand"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  linkedin.com/in/faizan-khalid-developerp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-5 text-xs text-muted sm:flex-row">
          <p>© {year} Payment Ledger. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-expense" /> by Faizan Khalid
          </p>
          <p>Secure • Private • Simple</p>
        </div>
      </div>
    </footer>
  );
}
