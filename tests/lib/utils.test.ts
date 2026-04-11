import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  escapeHtml,
  getNicheLabel,
  cn,
  addBusinessDays,
  formatPrice,
  toGoogleWriteReviewUrl,
} from "@/lib/utils";

// ── sanitizeHtml ──

describe("sanitizeHtml", () => {
  it("strips script tags with content", () => {
    expect(sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')).toBe(
      "<p>Hello</p>"
    );
  });

  it("strips self-closing script tags", () => {
    expect(sanitizeHtml('<script src="evil.js"/>')).toBe("");
  });

  it("strips iframe tags", () => {
    expect(
      sanitizeHtml('<iframe src="https://evil.com"></iframe>')
    ).toBe("");
  });

  it("strips object, embed, form, link, meta, base tags", () => {
    const input = '<object data="x"></object><embed src="x"/><form action="/"><input/></form>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("<object");
    expect(result).not.toContain("<embed");
    expect(result).not.toContain("<form");
  });

  it("removes event handlers (onclick, onerror, onload)", () => {
    expect(sanitizeHtml('<div onclick="alert(1)">text</div>')).toBe(
      "<div>text</div>"
    );
    expect(sanitizeHtml("<img onerror='alert(1)' src='x'>")).toBe(
      "<img src='x'>"
    );
  });

  it("neutralizes javascript: URLs in href", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("neutralizes data: URLs in src", () => {
    const result = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">');
    expect(result).not.toContain("data:");
  });

  it("keeps safe HTML intact", () => {
    const safe = '<div><h1>Title</h1><p>Hello <strong>world</strong></p></div>';
    expect(sanitizeHtml(safe)).toBe(safe);
  });
});

// ── escapeHtml ──

describe("escapeHtml", () => {
  it("escapes all special characters", () => {
    expect(escapeHtml('&<>"\''))
      .toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});

// ── getNicheLabel ──

describe("getNicheLabel", () => {
  it("returns label for known niches", () => {
    expect(getNicheLabel("DENTIST")).toBe("Dentiste");
    expect(getNicheLabel("OSTEOPATH")).toBe("Ostéopathe");
    expect(getNicheLabel("GARAGE")).toBe("Garage");
  });

  it("returns customNiche for OTHER when provided", () => {
    expect(getNicheLabel("OTHER", "Coiffeur")).toBe("Coiffeur");
  });

  it("returns 'Autre' for OTHER without customNiche", () => {
    expect(getNicheLabel("OTHER")).toBe("Autre");
    expect(getNicheLabel("OTHER", null)).toBe("Autre");
  });

  it("returns raw niche for unknown values", () => {
    expect(getNicheLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

// ── cn ──

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, undefined, "b", "")).toBe("a b");
  });

  it("returns empty string with no truthy values", () => {
    expect(cn(false, undefined)).toBe("");
  });
});

// ── addBusinessDays ──

describe("addBusinessDays", () => {
  it("adds business days skipping weekends", () => {
    // Friday 2026-04-10 + 1 business day = Monday 2026-04-13
    const friday = new Date(2026, 3, 10); // April 10, 2026 is a Friday
    const result = addBusinessDays(friday, 1);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(13);
  });

  it("adds 5 business days = 1 week", () => {
    const monday = new Date(2026, 3, 6); // Monday
    const result = addBusinessDays(monday, 5);
    expect(result.getDay()).toBe(1); // Next Monday
    expect(result.getDate()).toBe(13);
  });

  it("handles 0 days", () => {
    const date = new Date(2026, 3, 10);
    const result = addBusinessDays(date, 0);
    expect(result.getDate()).toBe(10);
  });

  it("does not mutate original date", () => {
    const date = new Date(2026, 3, 10);
    const original = date.getTime();
    addBusinessDays(date, 3);
    expect(date.getTime()).toBe(original);
  });
});

// ── formatPrice ──

describe("formatPrice", () => {
  it("returns 'Gratuit' for 0", () => {
    expect(formatPrice(0)).toBe("Gratuit");
  });

  it("formats integer prices", () => {
    const result = formatPrice(29);
    expect(result).toContain("29");
    expect(result).toContain("\u20AC"); // euro sign
  });

  it("formats decimal prices", () => {
    const result = formatPrice(9.99);
    expect(result).toContain("9,99");
    expect(result).toContain("\u20AC");
  });
});

// ── toGoogleWriteReviewUrl ──

describe("toGoogleWriteReviewUrl", () => {
  it("returns empty string for empty input", () => {
    expect(toGoogleWriteReviewUrl("")).toBe("");
  });

  it("converts a Place ID to writereview URL", () => {
    expect(toGoogleWriteReviewUrl("ChIJN1t_tDeuEmsRUsoyG83frY4")).toBe(
      "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
    );
  });

  it("returns writereview URL unchanged", () => {
    const url = "https://search.google.com/local/writereview?placeid=ChIJtest123";
    expect(toGoogleWriteReviewUrl(url)).toBe(url);
  });

  it("extracts placeid from URL params", () => {
    const result = toGoogleWriteReviewUrl(
      "https://www.google.com/maps?placeid=ChIJtest456"
    );
    expect(result).toBe(
      "https://search.google.com/local/writereview?placeid=ChIJtest456"
    );
  });

  it("handles g.page URLs", () => {
    const result = toGoogleWriteReviewUrl("https://g.page/r/mybusiness");
    expect(result).toBe("https://g.page/r/mybusiness/review");
  });

  it("handles g.page URLs already with /review", () => {
    const result = toGoogleWriteReviewUrl("https://g.page/r/mybusiness/review");
    expect(result).toBe("https://g.page/r/mybusiness/review");
  });

  it("rejects non-Google URLs", () => {
    expect(toGoogleWriteReviewUrl("https://evil.com/maps")).toBe("");
  });

  it("rejects non-Google URLs with placeid param", () => {
    expect(
      toGoogleWriteReviewUrl("https://evil.com?placeid=ChIJtest")
    ).toBe("");
  });
});
