import { mapBhkToPrisma, mapSourceToPrisma, mapTimelineToPrisma } from "@/lib/bhkMapping"
import { prisma } from "@/lib/prisma"
import { buyerSchema } from "@/lib/zod/buyerSchema"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import z from "zod"
import { ZodError } from "zod"

type Buyer = z.infer<typeof buyerSchema>

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing auth token' }, { status: 401 })
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
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !supabaseUser) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    })

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found in DB' },
        { status: 404 }
      )
    }

    const body = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Expected an array of buyers' },
        { status: 400 }
      )
    }

    const validatedBuyers: Buyer[] = []
    for (let i = 0; i < body.length; i++) {
      const parsed = buyerSchema.safeParse(body[i])
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Validation error at row ${i + 1}`,
            errors: parsed.error.errors,
          },
          { status: 400 }
        )
      }
      validatedBuyers.push(parsed.data)
    }

    // Start transaction
    const result = await prisma.$transaction(async tx => {
      const createdBuyers = []

      for (const buyer of validatedBuyers) {
        const buyerData = {
          ...buyer,
          bhk: mapBhkToPrisma(buyer.bhk),
          timeline: mapTimelineToPrisma(buyer.timeline),
          source: mapSourceToPrisma(buyer.source),
          tags: buyer.tags ? (Array.isArray(buyer.tags) ? buyer.tags : [buyer.tags]) : [],
          ownerId: dbUser.id,
        }

        const created = await tx.buyer.create({
          data: buyerData,
        })

        await tx.buyerHistory.create({
          data: {
            buyerId: created.id,
            changedBy: supabaseUser.email || 'unknown',
            diff: { created: buyer },
          },
        })

        createdBuyers.push(created)
      }

      return createdBuyers
    })

    return NextResponse.json({
      success: true,
      message: `Imported ${result.length} buyers successfully.`,
    })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('[IMPORT ERROR]', error)

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Server Error',
      },
      { status: 500 }
    )
  }
}
