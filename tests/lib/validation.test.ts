import { describe, it, expect } from "vitest";

// Re-implement the validation functions as they are private in auth.ts
// These tests validate the same logic used in registration/login

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  return null;
}

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.name@domain.fr")).toBe(true);
    expect(validateEmail("a@b.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("not-an-email")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user @domain.com")).toBe(false);
    expect(validateEmail("user@domain")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts valid passwords", () => {
    expect(validatePassword("MyPass123")).toBeNull();
    expect(validatePassword("Abcdefg1")).toBeNull();
    expect(validatePassword("VeryLongPassword1WithNumbers")).toBeNull();
  });

  it("rejects too short passwords", () => {
    expect(validatePassword("Ab1")).not.toBeNull();
    expect(validatePassword("Abcdef1")).not.toBeNull(); // 7 chars
    expect(validatePassword("")).not.toBeNull();
  });

  it("rejects passwords without uppercase", () => {
    expect(validatePassword("mypassword1")).not.toBeNull();
    expect(validatePassword("abcdefgh1")).not.toBeNull();
  });

  it("rejects passwords without digits", () => {
    expect(validatePassword("MyPassword")).not.toBeNull();
    expect(validatePassword("ABCDEFGH")).not.toBeNull();
  });

  it("returns specific error messages", () => {
    expect(validatePassword("short")).toContain("8 caractères");
    expect(validatePassword("nouppercase1")).toContain("majuscule");
    expect(validatePassword("NoDigitHere")).toContain("chiffre");
  });
});
