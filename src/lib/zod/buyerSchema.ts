import { z } from 'zod'

const emptyToUndefinedNumber = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.coerce.number().optional()
)

const emptyToUndefinedString = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().optional()
)

const allowedBhks = ['Studio', '1', '2', '3', '4']

export const buyerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: emptyToUndefinedString.refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email',
  }),  
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10 to 15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.string().optional(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: emptyToUndefinedNumber,
  budgetMax: emptyToUndefinedNumber,
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
  tags: z.array(z.string()).default([]),
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
})
.refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType)) {
    return data.bhk !== undefined && data.bhk !== null
  }
  return true
}, {
  message: 'BHK is required for Apartment or Villa',
  path: ['bhk'],
})    
