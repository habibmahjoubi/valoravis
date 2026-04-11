import { describe, it, expect } from "vitest";
import { NICHE_CONFIGS } from "@/config/niches";

describe("NICHE_CONFIGS", () => {
  const niches = ["DENTIST", "OSTEOPATH", "GARAGE", "OTHER"] as const;

  it("has all 4 niches defined", () => {
    for (const niche of niches) {
      expect(NICHE_CONFIGS[niche]).toBeDefined();
    }
  });

  for (const niche of niches) {
    describe(`${niche}`, () => {
      const config = NICHE_CONFIGS[niche];

      it("has a label", () => {
        expect(config.label).toBeTruthy();
        expect(typeof config.label).toBe("string");
      });

      it("has a positive defaultDelay", () => {
        expect(config.defaultDelay).toBeGreaterThan(0);
      });

      it("has vocabulary with required fields", () => {
        expect(config.vocabulary.client).toBeTruthy();
        expect(config.vocabulary.clients).toBeTruthy();
        expect(config.vocabulary.establishment).toBeTruthy();
        expect(config.vocabulary.visit).toBeTruthy();
      });

      it("has EMAIL template with subject and body", () => {
        expect(config.templates.EMAIL.subject).toBeTruthy();
        expect(config.templates.EMAIL.body).toBeTruthy();
      });

      it("has SMS template with body", () => {
        expect(config.templates.SMS.body).toBeTruthy();
      });

      it("templates contain required variables", () => {
        const emailBody = config.templates.EMAIL.body;
        const smsBody = config.templates.SMS.body;

        expect(emailBody).toContain("{{clientName}}");
        expect(emailBody).toContain("{{businessName}}");
        expect(emailBody).toContain("{{link}}");

        expect(smsBody).toContain("{{clientName}}");
        expect(smsBody).toContain("{{businessName}}");
        expect(smsBody).toContain("{{link}}");
      });

      it("has 3 EMAIL presets", () => {
        expect(config.presets.EMAIL).toHaveLength(3);
        for (const preset of config.presets.EMAIL) {
          expect(preset.name).toBeTruthy();
          expect(preset.body).toBeTruthy();
        }
      });

      it("has 3 SMS presets", () => {
        expect(config.presets.SMS).toHaveLength(3);
        for (const preset of config.presets.SMS) {
          expect(preset.name).toBeTruthy();
          expect(preset.body).toBeTruthy();
        }
      });

      it("presets have standard names (Formel, Amical, Relance)", () => {
        const names = config.presets.EMAIL.map((p) => p.name);
        expect(names).toContain("Formel");
        expect(names).toContain("Amical");
        expect(names).toContain("Relance");
      });
    });
  }

  it("DENTIST uses 'patient' vocabulary", () => {
    expect(NICHE_CONFIGS.DENTIST.vocabulary.client).toBe("patient");
    expect(NICHE_CONFIGS.DENTIST.vocabulary.establishment).toBe("cabinet");
  });

  it("GARAGE uses 'client' vocabulary", () => {
    expect(NICHE_CONFIGS.GARAGE.vocabulary.client).toBe("client");
    expect(NICHE_CONFIGS.GARAGE.vocabulary.establishment).toBe("garage");
  });

  it("OTHER uses generic vocabulary", () => {
    expect(NICHE_CONFIGS.OTHER.vocabulary.establishment).toBe("établissement");
  });
});
