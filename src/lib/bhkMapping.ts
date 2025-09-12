import { BHK, Source, Timeline } from '@prisma/client'

const bhkMap: Record<string, BHK> = {
  Studio: BHK.Studio,
  '1': BHK.One,
  '2': BHK.Two,
  '3': BHK.Three,
  '4': BHK.Four,
}

export function mapBhkToPrisma(bhk?: string): BHK | null {
  if (!bhk) return null
  return bhkMap[bhk] ?? null
}

export const timelineMap: Record<string, Timeline> = {
  'ZeroToThreeMonths': Timeline.ZeroToThreeMonths,
  'ThreeToSixMonths': Timeline.ThreeToSixMonths,
  'MoreThanSixMonths': Timeline.MoreThanSixMonths,
  Exploring: Timeline.Exploring,
}

export function mapTimelineToPrisma(t?: string): Timeline | null {
  if (!t || !(t in timelineMap)) {
    throw new Error(`Invalid timeline value: ${t}`)
  }
  return timelineMap[t]
}

export const sourceMap: Record<string, Source> = {
  Website: Source.Website,
  Referral: Source.Referral,
  'Walk-in': Source.WalkIn,
  Call: Source.Call,
  Other: Source.Other,
}

export function mapSourceToPrisma(s?: string): Source | null {
  if (!s || !(s in sourceMap)) {
    throw new Error(`Invalid source value: ${s}`)
  }
  return sourceMap[s]
}