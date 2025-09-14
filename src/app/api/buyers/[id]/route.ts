import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { mapBhkToPrisma, mapTimelineToPrisma, mapSourceToPrisma } from '@/lib/bhkMapping'
import { getAuthenticatedUser } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimiter'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: await params.id },
    })

    if (!buyer) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, buyer })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}


export async function POST(req: NextRequest) {
  console.log("POST /api/buyers received:", req)
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = buyerSchema.parse(body)

    const bhk = mapBhkToPrisma(data.bhk)
    const timeline = mapTimelineToPrisma(data.timeline)
    const source = mapSourceToPrisma(data.source)

    const newBuyer = await prisma.buyer.create({
      data: {
        ...data,
        bhk,
        timeline,
        source,
        ownerId: user.id,
        tags: Array.isArray(data.tags) ? data.tags.map(tag => tag.value) : [],
      },
    })

    return NextResponse.json({ success: true, ownerId: user.id }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/buyers error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Server Error' },
      { status: 500 }
    )
  }
}
 

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rateResult = checkRateLimit(user.id, 10, 60 * 1000)
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Rate limit exceeded. Try again in ${rateResult.retryAfter}s.`,
        },
        { status: 429 }
      )
    }

    const id = params.id
    const body = await req.json()
    const data = buyerSchema.parse(body)

    const existing = await prisma.buyer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 })
    }

    // Authorization: allow only owner or admin
    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    if (body.updatedAt && new Date(body.updatedAt).toISOString() !== existing.updatedAt.toISOString()) {
      return NextResponse.json({ success: false, message: 'Record changed, please refresh.' }, { status: 409 })
    }

    const bhk = mapBhkToPrisma(data.bhk)

    const updated = await prisma.buyer.update({
      where: { id },
      data: {
        ...data,
        bhk: bhk ?? null,
        timeline: mapTimelineToPrisma(data.timeline),
        source: mapSourceToPrisma(data.source),
        tags: Array.isArray(data.tags) ? data.tags.map(tag => tag.value) : [],
      },
    })

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: user.email || 'unknown',
        diff: {
          before: existing,
          after: updated,
        },
      },
    })

    return NextResponse.json({ success: true, buyer: updated })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Server Error' },
      { status: 500 }
    )
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id

    const existing = await prisma.buyer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 })
    }

    // Authorization: allow only owner or admin
    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    await prisma.buyer.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: error?.message || "Server Error" },
      { status: 500 }
    )
  }
}