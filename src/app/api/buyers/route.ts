import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { ZodError } from 'zod'
import { mapBhkToPrisma, mapSourceToPrisma, mapTimelineToPrisma } from '@/lib/bhkMapping'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 10

export async function GET(req: Request) { 
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') ?? '1')
    const city = url.searchParams.get('city') ?? undefined
    const propertyType = url.searchParams.get('propertyType') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const timeline = url.searchParams.get('timeline') ?? undefined
    const search = url.searchParams.get('search') ?? undefined

    const filters: any = {}

    if (city) filters.city = city
    if (propertyType) filters.propertyType = propertyType
    if (status) filters.status = status
    if (timeline) filters.timeline = timeline

    // Search filter (fullName, phone, email)
    const searchFilter = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const where = { ...filters, ...searchFilter }

    const [total, buyers] = await Promise.all([
      prisma.buyer.count({ where }),
      prisma.buyer.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ])

    return NextResponse.json({
      buyers,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    console.log("authHeader: ",authHeader);
    

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing auth token' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Find your user in your DB
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    })

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found in DB' },
        { status: 404 }
      )
    }

    // Validate body
    const body = await req.json()
    const data = buyerSchema.parse(body)

    // Build buyer data
    const buyerData = {
      ...data,
      bhk: mapBhkToPrisma(data.bhk),
      timeline: mapTimelineToPrisma(data.timeline),
      source: mapSourceToPrisma(data.source),
      tags: data.tags ?? [],
      ownerId: dbUser.id,
    }

    const buyer = await prisma.buyer.create({
      data: buyerData,
    })

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: supabaseUser.email || 'unknown',
        diff: { created: data },
      },
    })

    return NextResponse.json({ success: true, buyer })
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

    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Server Error',
      },
      { status: 500 }
    )
  }
}

