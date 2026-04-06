"use client";

import { useSearchParams, useRouter } from "next/navigation";

const PERIODS = [
  { value: "7", label: "7j" },
  { value: "30", label: "30j" },
  { value: "90", label: "90j" },
];

export function PeriodSelector() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("period") || "30";

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            current === p.value
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
