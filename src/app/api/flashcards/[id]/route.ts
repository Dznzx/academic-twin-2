export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const set = await prisma.flashcardSet.findFirst({
      where: { id: params.id, userId: user.id },
      include: { cards: { orderBy: { id: "asc" } } },
    });

    if (!set) return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });

    return NextResponse.json({ data: set });
  } catch (error) {
    console.error("[GET /api/flashcards/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
