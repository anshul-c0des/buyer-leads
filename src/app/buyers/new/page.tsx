'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buyerSchema } from '@/lib/zod/buyerSchema'
import { z } from 'zod'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FormData = z.infer<typeof buyerSchema>

export default function NewBuyerPage() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(buyerSchema),
  })

  const [submitting, setSubmitting] = useState(false)
  const propertyType = watch('propertyType')

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) {
        alert(result.message || 'Error creating lead')
      } else {
        alert('Lead created successfully!')
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Buyer Lead</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label>City</Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Mohali">Mohali</SelectItem>
                  <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                  <SelectItem value="Panchkula">Panchkula</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.propertyType && (
            <p className="text-sm text-red-500">{errors.propertyType.message}</p>
          )}
        </div>

        {/* BHK (conditional) */}
        {['Apartment', 'Villa'].includes(propertyType ?? '') && (
          <div className="space-y-2">
            <Label>BHK</Label>
                <Controller
                    name="bhk"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select BHK" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                />
            {errors.bhk && (
              <p className="text-sm text-red-500">{errors.bhk.message}</p>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register('notes')} />
          {errors.notes && (
            <p className="text-sm text-red-500">{errors.notes.message}</p>
          )}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Create Lead'}
        </Button>
      </form>
    </div>
  )
}
