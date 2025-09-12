import { BHK } from '@prisma/client'

const bhkMap: Record<string, BHK> = {
  Studio: BHK.Studio,
  '1': BHK.One,
  '2': BHK.Two,
  '3': BHK.Three,
  '4': BHK.Four,
}

export function mapBhkToPrisma(bhk?: string | null): BHK | null {
  if (!bhk) return null
  return bhkMap[bhk] ?? null
}
