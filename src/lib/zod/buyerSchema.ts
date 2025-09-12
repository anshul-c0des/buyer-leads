import { z } from 'zod'

export const buyerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('').transform(() => undefined)),
    phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10 to 15 digits'),
    city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
    propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
    bhk: z.enum(['Studio', '1', '2', '3', '4']).optional(),
    purpose: z.enum(['Buy', 'Rent']),
    budgetMin: z.coerce.number().optional(),
    budgetMax: z.coerce.number().optional(),
    timeline: z.enum([
      'ZeroToThreeMonths',
      'ThreeToSixMonths',
      'MoreThanSixMonths',
      'Exploring',
    ]),
    source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']),
    status: z
    .enum([
      'New',
      'Qualified',
      'Contacted',
      'Visited',
      'Negotiation',
      'Converted',
      'Dropped',
    ])
    .default('New'),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((data) => {
    if (
      data.budgetMax !== undefined &&
      data.budgetMin !== undefined &&
      data.budgetMax < data.budgetMin
    ) {
      return false
    }
    return true
  }, {
    message: 'Max budget must be greater than or equal to Min budget',
    path: ['budgetMax'],
  }).refine((data) => {
    if (['Apartment', 'Villa'].includes(data.propertyType)) {
      return data.bhk !== undefined && data.bhk !== null
    }
    return true
  }, {
    message: 'BHK is required for Apartment or Villa',
    path: ['bhk'],
})
