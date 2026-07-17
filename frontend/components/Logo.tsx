type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 40, showWordmark = false, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Payment Ledger"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logoGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2dd4bf" />
            <stop offset="0.55" stopColor="#0d9488" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#logoGrad)" />
        <rect x="14" y="16" width="36" height="32" rx="8" fill="white" fillOpacity="0.95" />
        <path
          d="M22 26h20"
          stroke="#0f766e"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M22 33h14"
          stroke="#0f766e"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M22 40h10"
          stroke="#0f766e"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="42" cy="40" r="8.5" fill="#0d9488" />
        <path
          d="M42 35.5v9M38.8 38.2c1.2-1.8 5.4-1.9 6.2.4.9 2.5-4.8 2.1-5.5 4.4-.6 1.9 4.2 2.4 5.8.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-tight text-brand">PayLedger</span>
      ) : null}
    </div>
  );
}
