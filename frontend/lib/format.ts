export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}Rs ${abs.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}

export function formatDate(d: string | Date): string {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(d: string | Date): string {
  const date = new Date(d);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function toDatetimeLocal(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Freelance",
  "Gift",
  "Investment",
  "Loan Received",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Food",
  "Grocery",
  "Rent",
  "Bills",
  "Transport",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Loan Given",
  "Other",
];
