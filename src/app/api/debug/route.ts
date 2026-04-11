import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL ? "set" : "MISSING";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "MISSING";
  checks.AUTH_URL = process.env.AUTH_URL ?? "MISSING";
  checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST ?? "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "MISSING";
  checks.VERCEL_URL = process.env.VERCEL_URL ?? "MISSING";

  // Check DB connection
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    checks.db = `connected (${count} users)`;
  } catch (e: unknown) {
    checks.db = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check NextAuth
  try {
    const { auth } = await import("@/lib/auth");
    checks.nextauth_import = "ok";
  } catch (e: unknown) {
    checks.nextauth_import = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}
