import { describe, it, expect } from "vitest";
import { formatFrPhone } from "@/lib/sms";
import { toSmsSenderId, stripAccents } from "@/lib/utils";

describe("formatFrPhone", () => {
  it("converts French 06 / 07 numbers to E.164", () => {
    expect(formatFrPhone("0612345678")).toBe("+33612345678");
    expect(formatFrPhone("0712345678")).toBe("+33712345678");
  });

  it("keeps international format unchanged", () => {
    expect(formatFrPhone("+33612345678")).toBe("+33612345678");
    expect(formatFrPhone("+1234567890")).toBe("+1234567890");
  });

  it("adds + when missing and not a national number", () => {
    expect(formatFrPhone("33612345678")).toBe("+33612345678");
  });

  it("strips spaces, dots, dashes, parens", () => {
    expect(formatFrPhone("06 12 34 56 78")).toBe("+33612345678");
    expect(formatFrPhone("01.45.67.89.00")).toBe("+33145678900");
    expect(formatFrPhone(" (06) 12-34-56-78 ")).toBe("+33612345678");
  });

  it("handles 00 international prefix", () => {
    expect(formatFrPhone("0033612345678")).toBe("+33612345678");
  });

  it("handles landline numbers", () => {
    expect(formatFrPhone("0145678900")).toBe("+33145678900");
  });
});

describe("toSmsSenderId", () => {
  it("derives an alphanumeric id from a business name", () => {
    expect(toSmsSenderId("Garage Dupont")).toBe("GarageDupon");
    expect(toSmsSenderId("Cabinet Dentaire Martin")).toBe("CabinetDent");
  });

  it("strips accents and punctuation", () => {
    expect(toSmsSenderId("Osteo Santé & Co")).toBe("OsteoSanteC");
    expect(toSmsSenderId("L'Atelier")).toBe("LAtelier");
  });

  it("caps at 11 characters", () => {
    expect(toSmsSenderId("Établissement Extraordinaire")).toBe("Etablisseme");
  });

  it("returns null when no usable id can be produced", () => {
    expect(toSmsSenderId(null)).toBeNull();
    expect(toSmsSenderId("")).toBeNull();
    expect(toSmsSenderId("   ")).toBeNull();
    expect(toSmsSenderId("12345")).toBeNull(); // no letter
    expect(toSmsSenderId("---")).toBeNull();
  });
});

describe("stripAccents", () => {
  it("removes French accents", () => {
    expect(stripAccents("séance véhicule à côté")).toBe("seance vehicule a cote");
    expect(stripAccents("Notre établissement vous remercie")).toBe(
      "Notre etablissement vous remercie"
    );
  });
  it("leaves plain ASCII untouched", () => {
    expect(stripAccents("Bonjour Marie")).toBe("Bonjour Marie");
  });
});
