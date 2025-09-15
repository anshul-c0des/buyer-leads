import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buyerSchema } from "@/lib/zod/buyerSchema";
import { ZodError } from "zod";
import {
  mapBhkToPrisma,
  mapSourceToPrisma,
  mapTimelineToPrisma,
} from "@/lib/bhkMapping";
import { createClient } from "@supabase/supabase-js";

//POST api/buyers/import: import valid rows from imported csv
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing auth token" },
        { status: 401 }
      );
    }

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
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !supabaseUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found in DB" },
        { status: 404 }
      );
    }

    const body = await req.json();   // parse json

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Expected an array of buyers" },
        { status: 400 }
      );
    }

    const validBuyers = [];
    const errors = [];

    for (let i = 0; i < body.length; i++) {   // validates each lead
      const row = body[i];
      const result = buyerSchema.safeParse(row);
      if (!result.success) {
        errors.push({
          row: i + 1,
          errors: result.error.errors.map(
            (e) => `${e.path.join(".")}: ${e.message}`
          ),
        });
      } else {
        validBuyers.push(result.data);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation errors", errors },
        { status: 400 }
      );
    }

    // Create buyers in DB with ownerId linked
    const createdBuyers = [];
    for (const buyer of validBuyers) {
      const buyerData = {
        ...buyer,
        bhk: mapBhkToPrisma(buyer.bhk),
        timeline: mapTimelineToPrisma(buyer.timeline),
        source: mapSourceToPrisma(buyer.source),
        tags: Array.isArray(buyer.tags)
          ? buyer.tags
          : buyer.tags
          ? [buyer.tags]
          : [],
        ownerId: dbUser.id,
      };

      const createdBuyer = await prisma.buyer.create({ data: buyerData });   // creates buyer

      await prisma.buyerHistory.create({   // logs in created buyer
        data: {
          buyerId: createdBuyer.id,
          changedBy: supabaseUser.email || "unknown",
          diff: { created: buyer },
        },
      });

      createdBuyers.push(createdBuyer);
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${createdBuyers.length} buyers`,
      buyers: createdBuyers,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server Error",
      },
      { status: 500 }
    );
  }
}
