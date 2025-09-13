// /src/app/api/my-buyers/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const buyers = await prisma.buyer.findMany({
    where: { ownerId: dbUser.id },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ buyers })
}
