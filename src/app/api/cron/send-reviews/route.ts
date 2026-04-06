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

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!safeCompare(authHeader, expected)) {
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
