import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Hit daily by Vercel Cron (see vercel.json) to generate real database
// activity so the Supabase free-tier project doesn't auto-pause after
// 7 days of inactivity.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userCount = await prisma.user.count();
  return NextResponse.json({ ok: true, userCount, timestamp: new Date().toISOString() });
}
