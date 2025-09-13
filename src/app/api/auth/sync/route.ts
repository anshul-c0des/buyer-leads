import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Missing auth token" }, { status: 401 })
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Invalid user or token" }, { status: 401 })
  }

  const { email, phone, user_metadata } = user

  const dbUser = await prisma.user.upsert({
    where: { supabaseId: user.id },
    update: {
      email,
      phone: phone ?? '',
      name: user_metadata?.name || 'No Name',
    },
    create: {
      supabaseId: user.id,
      email: user.email!,
      phone: phone ?? '',
      name: user_metadata?.name || 'No Name',
    },
  })

  return NextResponse.json({ user: dbUser })
}
