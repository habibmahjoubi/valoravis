import { describe, it, expect } from "vitest";
import {
  hasFeature,
  getImportLimit,
  getRequiredPlanLabel,
  IMPORT_LIMIT,
  FEATURE_REQUIRED_PLAN,
} from "@/config/plan-features";

describe("hasFeature", () => {
  // Free plan
  it("free plan has no features", () => {
    expect(hasFeature("free", "sms")).toBe(false);
    expect(hasFeature("free", "custom_templates")).toBe(false);
    expect(hasFeature("free", "csv_import")).toBe(false);
    expect(hasFeature("free", "detailed_stats")).toBe(false);
    expect(hasFeature("free", "advanced_stats")).toBe(false);
    expect(hasFeature("free", "priority_support")).toBe(false);
  });

  // Pro plan
  it("pro plan has sms, custom_templates, csv_import, detailed_stats", () => {
    expect(hasFeature("pro", "sms")).toBe(true);
    expect(hasFeature("pro", "custom_templates")).toBe(true);
    expect(hasFeature("pro", "csv_import")).toBe(true);
    expect(hasFeature("pro", "detailed_stats")).toBe(true);
  });

  it("pro plan does NOT have advanced_stats or priority_support", () => {
    expect(hasFeature("pro", "advanced_stats")).toBe(false);
    expect(hasFeature("pro", "priority_support")).toBe(false);
  });

  // Business plan
  it("business plan has all features", () => {
    expect(hasFeature("business", "sms")).toBe(true);
    expect(hasFeature("business", "custom_templates")).toBe(true);
    expect(hasFeature("business", "csv_import")).toBe(true);
    expect(hasFeature("business", "detailed_stats")).toBe(true);
    expect(hasFeature("business", "advanced_stats")).toBe(true);
    expect(hasFeature("business", "priority_support")).toBe(true);
  });

  // Unknown plan
  it("returns false for unknown plan", () => {
    expect(hasFeature("unknown", "sms")).toBe(false);
    expect(hasFeature("", "sms")).toBe(false);
  });
});

describe("getImportLimit", () => {
  it("returns 0 for free plan", () => {
    expect(getImportLimit("free")).toBe(0);
  });

  it("returns 100 for pro plan", () => {
    expect(getImportLimit("pro")).toBe(100);
  });

  it("returns 5000 for business plan", () => {
    expect(getImportLimit("business")).toBe(5000);
  });

  it("returns 0 for unknown plan", () => {
    expect(getImportLimit("unknown")).toBe(0);
  });
});

describe("getRequiredPlanLabel", () => {
  it("returns 'Pro' for sms feature", () => {
    expect(getRequiredPlanLabel("sms")).toBe("Pro");
  });

  it("returns 'Pro' for custom_templates", () => {
    expect(getRequiredPlanLabel("custom_templates")).toBe("Pro");
  });

  it("returns 'Business' for advanced_stats", () => {
    expect(getRequiredPlanLabel("advanced_stats")).toBe("Business");
  });

  it("returns 'Business' for priority_support", () => {
    expect(getRequiredPlanLabel("priority_support")).toBe("Business");
  });
});

describe("IMPORT_LIMIT constants", () => {
  it("has correct values", () => {
    expect(IMPORT_LIMIT.free).toBe(0);
    expect(IMPORT_LIMIT.pro).toBe(100);
    expect(IMPORT_LIMIT.business).toBe(5000);
  });
});

describe("FEATURE_REQUIRED_PLAN constants", () => {
  it("maps features to minimum required plan", () => {
    expect(FEATURE_REQUIRED_PLAN.sms).toBe("pro");
    expect(FEATURE_REQUIRED_PLAN.csv_import).toBe("pro");
    expect(FEATURE_REQUIRED_PLAN.custom_templates).toBe("pro");
    expect(FEATURE_REQUIRED_PLAN.detailed_stats).toBe("pro");
    expect(FEATURE_REQUIRED_PLAN.advanced_stats).toBe("business");
    expect(FEATURE_REQUIRED_PLAN.priority_support).toBe("business");
  });
});
