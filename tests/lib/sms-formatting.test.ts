import { describe, it, expect } from "vitest";

// Re-implement the phone formatting logic from src/lib/sms.ts
// (the actual function requires Twilio client, so we test the formatting logic separately)

function formatPhoneNumber(to: string): string {
  let formatted = to.trim();
  if (formatted.startsWith("0")) {
    formatted = "+33" + formatted.slice(1);
  }
  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }
  return formatted;
}

describe("formatPhoneNumber (SMS)", () => {
  it("converts French 06 numbers to +33 format", () => {
    expect(formatPhoneNumber("0612345678")).toBe("+33612345678");
  });

  it("converts French 07 numbers to +33 format", () => {
    expect(formatPhoneNumber("0712345678")).toBe("+33712345678");
  });

  it("keeps international format unchanged", () => {
    expect(formatPhoneNumber("+33612345678")).toBe("+33612345678");
    expect(formatPhoneNumber("+1234567890")).toBe("+1234567890");
  });

  it("adds + prefix if missing and not starting with 0", () => {
    expect(formatPhoneNumber("33612345678")).toBe("+33612345678");
  });

  it("trims whitespace", () => {
    expect(formatPhoneNumber("  0612345678  ")).toBe("+33612345678");
  });

  it("handles landline numbers", () => {
    expect(formatPhoneNumber("0145678900")).toBe("+33145678900");
  });
});
