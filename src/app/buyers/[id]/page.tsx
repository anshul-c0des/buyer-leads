"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { buyerSchema } from "@/lib/zod/buyerSchema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"

type BuyerFormData = z.infer<typeof buyerSchema>

export default function EditBuyerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {},
  })

  const bhkReverseMap: Record<string, string> = {
    Studio: "Studio",
    One: "1",
    Two: "2",
    Three: "3",
    Four: "4",
  }
  
  useEffect(() => {
    if (!id) return
    async function fetchBuyer() {
      setLoading(true)
      try {
        const res = await fetch(`/api/buyers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch buyer")
        const data = await res.json()
  
        const buyerData = {
          ...data.buyer,
          bhk: data.buyer.bhk ? bhkReverseMap[data.buyer.bhk] ?? "" : "",
        }
  
        reset(buyerData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [id, reset])
  

  const onSubmit = async (data: BuyerFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update buyer")
      }

      router.push("/buyers")
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this buyer?")) return

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed")
      }

      router.push("/buyers")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Buyer Lead</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* City */}
        <div>
          <Label>City</Label>
          <Input {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>

        {/* Property Type */}
        <div>
          <Label>Property Type</Label>
          <Input {...register("propertyType")} />
          {errors.propertyType && <p className="text-sm text-red-500">{errors.propertyType.message}</p>}
        </div>

        {/* BHK */}
        {["Apartment", "Villa"].includes(watch("propertyType") ?? "") && (
          <div>
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


        {/* Budget Min */}
        <div>
          <Label>Minimum Budget</Label>
          <Input
            type="number"
            {...register("budgetMin", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.budgetMin && <p className="text-sm text-red-500">{errors.budgetMin.message}</p>}
        </div>

        {/* Budget Max */}
        <div>
          <Label>Maximum Budget</Label>
          <Input
            type="number"
            {...register("budgetMax", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.budgetMax && <p className="text-sm text-red-500">{errors.budgetMax.message}</p>}
        </div>

        {/* Timeline */}
        <div>
          <Label>Timeline</Label>
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZeroToThreeMonths">0-3 Months</SelectItem>
                  <SelectItem value="ThreeToSixMonths">3-6 Months</SelectItem>
                  <SelectItem value="MoreThanSixMonths">6+ Months</SelectItem>
                  <SelectItem value="Exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.timeline && <p className="text-sm text-red-500">{errors.timeline.message}</p>}
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
        </div>

        {/* Source */}
        <div>
          <Label>Source</Label>
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="WalkIn">Walk-in</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.source && <p className="text-sm text-red-500">{errors.source.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Delete Buyer"}
          </Button>
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </form>
    </div>
  )
}
