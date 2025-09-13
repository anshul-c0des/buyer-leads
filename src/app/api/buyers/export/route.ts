import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse } from 'json2csv'
import { createClient } from '@supabase/supabase-js'

const CSV_FIELDS = [
  'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk',
  'purpose', 'budgetMin', 'budgetMax', 'timeline',
  'source', 'notes', 'tags', 'status'
]

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const city = url.searchParams.get('city')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('q') // same as "search"
    const sort = url.searchParams.get('sort') ?? 'updatedAt'
    const direction = url.searchParams.get('direction') ?? 'desc'

    // --- OPTIONAL: Auth to restrict to current user ---
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    let ownerId: string | null = null
    let isAdmin = false

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
      )

      const { data: { user }, error } = await supabase.auth.getUser()
      if (!error && user) {
        const dbUser = await prisma.user.findUnique({
          where: { supabaseId: user.id },
        })
        if (dbUser) {
          ownerId = dbUser.id
          isAdmin = dbUser.role === 'ADMIN'
        }
      }
    }

    // Apply filters
    const where: any = {}

    if (city) where.city = city
    if (status) where.status = status

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (!isAdmin && ownerId) {
      where.ownerId = ownerId
    }

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: {
        [sort]: direction === 'asc' ? 'asc' : 'desc',
      },
    })

    const csv = parse(buyers, { fields: CSV_FIELDS })

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="buyers.csv"',
      },
    })
  } catch (error) {
    console.error('CSV Export Error:', error)
    return NextResponse.json({ error: 'Failed to export buyers' }, { status: 500 })
  }
}
