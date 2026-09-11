import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "uts-study-center",
      persistence: process.env.VERCEL ? "browser-local" : "sqlite",
      aiConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
