"use client";

import { useState } from "react";
import { updateUserPlan } from "@/actions/admin";

const PLANS = [
  { value: "free", label: "Free", quota: 50 },
  { value: "pro", label: "Pro", quota: 200 },
  { value: "business", label: "Business", quota: 500 },
];

export function ChangePlanForm({
  userId,
  currentPlan,
  currentQuota,
}: {
  userId: string;
  currentPlan: string;
  currentQuota: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80"
      >
        {currentPlan}
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateUserPlan(formData);
        setOpen(false);
      }}
      className="inline-flex items-center gap-1"
    >
      <input type="hidden" name="userId" value={userId} />
      <select
        name="plan"
        defaultValue={currentPlan}
        onChange={(e) => {
          const plan = PLANS.find((p) => p.value === e.target.value);
          const quotaInput = e.target.form?.querySelector(
            'input[name="monthlyQuota"]'
          ) as HTMLInputElement;
          if (plan && quotaInput) quotaInput.value = String(plan.quota);
        }}
        className="px-1.5 py-0.5 border border-border rounded text-xs bg-card"
      >
        {PLANS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <input
        type="hidden"
        name="monthlyQuota"
        defaultValue={currentQuota}
      />
      <button
        type="submit"
        className="px-1.5 py-0.5 rounded text-xs bg-primary text-primary-foreground"
      >
        OK
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground"
      >
        x
      </button>
    </form>
  );
}
