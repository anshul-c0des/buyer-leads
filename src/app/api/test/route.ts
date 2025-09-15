import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const count = await prisma.buyer.count();
    res.status(200).json({ message: 'Database connected!', buyerCount: count });
  } catch (error) {
    console.error('DB connection error:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  } finally {
    await prisma.$disconnect();
  }
}
