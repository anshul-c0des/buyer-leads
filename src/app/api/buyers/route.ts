import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const buyer = await prisma.buyer.create({
      data,
    });

    return NextResponse.json({ success: true, buyer });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Error creating buyer', error: err },
      { status: 500 }
    );
  }
}
