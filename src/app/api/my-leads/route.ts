import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 })
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
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found in DB" }, { status: 404 })
    }

    const buyers = await prisma.buyer.findMany({
      where: {
        ownerId: dbUser.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ success: true, buyers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
