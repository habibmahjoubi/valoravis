import { NextResponse } from "next/server";
import { processPendingRequests } from "@/services/review-request.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
