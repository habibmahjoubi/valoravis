import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  // Use unique keys per test to avoid cross-test pollution
  let keyCounter = 0;
  function uniqueKey() {
    return `test-key-${Date.now()}-${keyCounter++}`;
  }

  it("allows first request", () => {
    const result = rateLimit(uniqueKey(), { maxAttempts: 3, windowMs: 60000 });
    expect(result.success).toBe(true);
  });

  it("allows requests up to maxAttempts", () => {
    const key = uniqueKey();
    const opts = { maxAttempts: 3, windowMs: 60000 };

    expect(rateLimit(key, opts).success).toBe(true); // 1
    expect(rateLimit(key, opts).success).toBe(true); // 2
    expect(rateLimit(key, opts).success).toBe(true); // 3
  });

  it("blocks after maxAttempts exceeded", () => {
    const key = uniqueKey();
    const opts = { maxAttempts: 2, windowMs: 60000 };

    rateLimit(key, opts); // 1
    rateLimit(key, opts); // 2

    const blocked = rateLimit(key, opts); // 3 → blocked
    expect(blocked.success).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("returns retryAfterSeconds when blocked", () => {
    const key = uniqueKey();
    const opts = { maxAttempts: 1, windowMs: 30000 };

    rateLimit(key, opts); // 1
    const blocked = rateLimit(key, opts); // blocked

    expect(blocked.success).toBe(false);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(30);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after window expires", async () => {
    const key = uniqueKey();
    const opts = { maxAttempts: 1, windowMs: 50 }; // 50ms window

    rateLimit(key, opts);
    expect(rateLimit(key, opts).success).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));

    expect(rateLimit(key, opts).success).toBe(true);
  });

  it("tracks different keys independently", () => {
    const key1 = uniqueKey();
    const key2 = uniqueKey();
    const opts = { maxAttempts: 1, windowMs: 60000 };

    rateLimit(key1, opts);
    expect(rateLimit(key1, opts).success).toBe(false);
    expect(rateLimit(key2, opts).success).toBe(true); // different key
  });
});
