import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { mapBhkToPrisma, mapSourceToPrisma, mapTimelineToPrisma } from '@/lib/bhkMapping'
import { createClient } from '@supabase/supabase-js'
import z from 'zod'


export async function POST(req: Request) {
  const body = await req.json()

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (body.length > 200) {
    return NextResponse.json({ error: 'Limit 200 rows max' }, { status: 400 })
  }

  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 })
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
    return NextResponse.json({ error: "Invalid token or user not found" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 })
  }

  const parsed: z.infer<typeof buyerSchema>[] = []

  for (const row of body) {
    const result = buyerSchema.safeParse(row)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', issues: result.error.format() }, { status: 400 })
    }
    parsed.push(result.data)
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const buyer of parsed) {
        const created = await tx.buyer.create({
          data: {
            ...buyer,
            bhk: mapBhkToPrisma(buyer.bhk),
            timeline: mapTimelineToPrisma(buyer.timeline),
            source: mapSourceToPrisma(buyer.source),
            tags: Array.isArray(buyer.tags) ? buyer.tags.map(t => t.trim()) : (buyer.tags?.split(',').map(t => t.trim()) ?? []),
            ownerId: dbUser.id,
          },
        })

        await tx.buyerHistory.create({
          data: {
            buyerId: created.id,    
            diff: buyer,
            changedBy: dbUser.id,
          },
        })
      }
    })

    return NextResponse.json({ message: `${parsed.length} buyers imported.` })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error', details: err }, { status: 500 })
  }
}
