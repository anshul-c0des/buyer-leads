import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { user } = await req.json()

    if (!user) {
      return NextResponse.json({ error: 'User missing' }, { status: 400 })
    }

    const { id, email, phone, user_metadata } = user

    const upsertedUser = await prisma.user.upsert({
      where: { supabaseId: id },
      update: {
        email,
        phone: phone ?? '',
        name: user_metadata?.full_name || user_metadata?.name || 'No Name',
      },
      create: {
        supabaseId: id,
        email,
        phone: phone ?? '',
        name: user_metadata?.full_name || user_metadata?.name || 'No Name',
      },
    })

    return NextResponse.json({ user: upsertedUser })
  } catch (error) {
    console.error('Sync Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
