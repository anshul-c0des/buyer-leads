import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET api/buyer_history: retrieves list of change history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const limitParam = searchParams.get("limit") ?? "5";
    const sort = searchParams.get("sort") ?? "desc";

    if (!buyerId) {
      return NextResponse.json(
        { success: false, message: "Missing buyerId" },
        { status: 400 }
      );
    }

    const limit = parseInt(limitParam, 10);   // optional limit
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid limit" },
        { status: 400 }
      );
    }

    if (!["asc", "desc"].includes(sort)) {   // sort parameter
      return NextResponse.json(
        { success: false, message: "Invalid sort" },
        { status: 400 }
      );
    }

    const history = await prisma.buyerHistory.findMany({
      where: { buyerId },
      orderBy: { changedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
