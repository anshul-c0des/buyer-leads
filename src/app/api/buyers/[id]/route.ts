import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { mapBhkToPrisma, mapTimelineToPrisma, mapSourceToPrisma } from '@/lib/bhkMapping'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
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


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const data = buyerSchema.parse(body)

    const existing = await prisma.buyer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 })
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
        tags: data.tags ?? [],
      },
    })

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: 'demo-user',
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
    const id = params.id

    const buyer = await prisma.buyer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: error?.message || "Server Error" },
      { status: 500 }
    )
  }
}
