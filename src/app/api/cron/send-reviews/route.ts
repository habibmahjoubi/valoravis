import { NextResponse } from "next/server";
import { processPendingRequests } from "@/services/review-request.service";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function authenticate(request: Request): boolean {
  const authHeader = request.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  return safeCompare(authHeader, expected);
}

// POST for external callers (state-changing operation)
export async function POST(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processPendingRequests();

  return NextResponse.json({
    ok: true,
    sent: results.sent,
    failed: results.failed,
    timestamp: new Date().toISOString(),
  });
}

// GET kept for Vercel Cron compatibility (Vercel sends GET requests)
export async function GET(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processPendingRequests();

  return NextResponse.json({
    ok: true,
    sent: results.sent,
    failed: results.failed,
    timestamp: new Date().toISOString(),
  });
}
