"use client";

import { useSearchParams, useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "SENT", label: "Envoyé" },
  { value: "CLICKED", label: "Cliqué" },
  { value: "REVIEWED", label: "Avis laissé" },
  { value: "FEEDBACK", label: "Feedback" },
  { value: "FAILED", label: "Échoué" },
];

const CHANNEL_OPTIONS = [
  { value: "", label: "Tous les canaux" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
];

const PERIOD_OPTIONS = [
  { value: "", label: "Toutes les périodes" },
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

export function CampaignFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/campaigns?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("channel") || ""}
        onChange={(e) => updateFilter("channel", e.target.value)}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {CHANNEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("period") || ""}
        onChange={(e) => updateFilter("period", e.target.value)}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
