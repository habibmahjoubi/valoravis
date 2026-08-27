import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  getNicheLabel,
  cn,
  addBusinessDays,
  formatPrice,
  toGoogleWriteReviewUrl,
  csvCell,
  isFormulaInjection,
  formString,
} from "@/lib/utils";
import { sanitizeTemplateHtml } from "@/lib/sanitize";

// ── sanitizeTemplateHtml ──

describe("sanitizeTemplateHtml", () => {
  it("strips script tags with content", () => {
    const r = sanitizeTemplateHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(r).toContain("Hello");
    expect(r).not.toContain("<script");
    expect(r).not.toContain("alert");
  });

  it("strips iframe / object / embed / form / style / svg", () => {
    for (const bad of [
      '<iframe src="https://evil.com"></iframe>',
      '<object data="x"></object>',
      '<embed src="x"/>',
      '<form action="/"><input/></form>',
      "<style>body{display:none}</style>",
      '<svg onload="alert(1)"></svg>',
    ]) {
      const r = sanitizeTemplateHtml(bad);
      expect(r).not.toMatch(/<(iframe|object|embed|form|input|style|svg)/i);
    }
  });

  it("removes event handlers", () => {
    const r = sanitizeTemplateHtml('<div onclick="alert(1)">text</div>');
    expect(r).toContain("text");
    expect(r).not.toContain("onclick");
  });

  it("neutralizes javascript:/vbscript:/data: URLs", () => {
    expect(sanitizeTemplateHtml('<a href="javascript:alert(1)">c</a>')).not.toContain("javascript:");
    expect(sanitizeTemplateHtml('<a href="vbscript:alert(1)">c</a>')).not.toContain("vbscript:");
    expect(sanitizeTemplateHtml('<a href="data:text/html,x">c</a>')).not.toContain("data:");
  });

  it("keeps safe formatting", () => {
    const r = sanitizeTemplateHtml('<div><h2>Title</h2><p>Hello <strong>world</strong></p></div>');
    expect(r).toContain("<h2>Title</h2>");
    expect(r).toContain("<strong>world</strong>");
  });

  it("resists tag-reconstruction bypass", () => {
    const r = sanitizeTemplateHtml("<scr<script>ipt>alert(1)</script>");
    expect(r).not.toContain("<script");
  });

  it("adds rel=noopener to links", () => {
    const r = sanitizeTemplateHtml('<a href="https://example.com">x</a>');
    expect(r).toContain('rel="noopener noreferrer"');
  });
});

// ── csvCell / isFormulaInjection ──

describe("csvCell", () => {
  it("quotes and doubles inner quotes", () => {
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it("neutralises formula-injection leading chars", () => {
    expect(csvCell("=1+1")).toBe("\"'=1+1\"");
    expect(csvCell("@SUM(A1)")).toBe("\"'@SUM(A1)\"");
  });
  it("handles null/undefined/number", () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(42)).toBe('"42"');
  });
  it("prevents column breakout", () => {
    expect(csvCell('x","=2')).toBe('"x"",""=2"');
  });
});

describe("isFormulaInjection", () => {
  it("flags leading = + - @ tab CR", () => {
    for (const s of ["=x", "+x", "-x", "@x", "\tx", "\rx"]) {
      expect(isFormulaInjection(s)).toBe(true);
    }
  });
  it("passes normal values and empty", () => {
    expect(isFormulaInjection("Jean Dupont")).toBe(false);
    expect(isFormulaInjection(null)).toBe(false);
    expect(isFormulaInjection("")).toBe(false);
  });
});

describe("formString", () => {
  it("returns the string value", () => {
    const fd = new FormData();
    fd.set("a", "hello");
    expect(formString(fd, "a")).toBe("hello");
  });
  it("returns empty string when missing", () => {
    expect(formString(new FormData(), "missing")).toBe("");
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
