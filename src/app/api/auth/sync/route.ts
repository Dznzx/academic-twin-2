export const dynamic = "force-dynamic";
// src/app/api/auth/sync/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.fullName ?? clerkUser.firstName ?? "Student",
        avatar: clerkUser.imageUrl,
      },
      update: {
        name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
        avatar: clerkUser.imageUrl,
      },
    });

    // Ensure analytics row exists
    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[POST /api/auth/sync]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
