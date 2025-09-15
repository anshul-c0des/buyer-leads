import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "json2csv";
import { createClient } from "@supabase/supabase-js";

const CSV_FIELDS = [
  "fullName",
  "email",
  "phone",
  "city",
  "propertyType",
  "bhk",
  "purpose",
  "budgetMin",
  "budgetMax",
  "timeline",
  "source",
  "notes",
  "tags",
  "status",
];

// GET /api/buyers/export: exports filtered buyers as csv 
// **OPTIONALLY restricts data based on user authentication and role (admin vs regular user)**
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const city = url.searchParams.get("city");   // parse optional query filters
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("q");
    const sort = url.searchParams.get("sort") ?? "updatedAt";
    const direction = url.searchParams.get("direction") ?? "desc";

    // OPTIONAL: Auth to restrict to current user
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    let ownerId: string | null = null;
    let isAdmin = false;

    if (token) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        const dbUser = await prisma.user.findUnique({
          where: { supabaseId: user.id },
        });
        if (dbUser) {
          ownerId = dbUser.id;
          isAdmin = dbUser.role === "ADMIN";
        }
      }
    }

    // Apply filters
    const where: any = {};

    if (city) where.city = city;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (!isAdmin && ownerId) {   // if user!=admin, restricts results to their own leads
      where.ownerId = ownerId;
    }

    const buyers = await prisma.buyer.findMany({   // query buyers with filters and ordering
      where,
      orderBy: {
        [sort]: direction === "asc" ? "asc" : "desc",
      },
    });

    const csv = parse(buyers, { fields: CSV_FIELDS });   // convert to csv string

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="buyers.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export buyers" },
      { status: 500 }
    );
  }
}
