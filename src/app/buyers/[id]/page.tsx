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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  const propertyType = watch("propertyType")

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace("/login")
        return
      }
      const accessToken = session?.access_token

      try {
        const res = await fetch(`/api/buyers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch buyer")
        const { buyer } = await res.json()

        const buyerData = {
          ...buyer,
          bhk: buyer.bhk ?? "",
          tags: buyer.tags?.join(", ") ?? "",
        }

        reset(buyerData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [id, reset, router])

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this buyer?")) return

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Delete failed")
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
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div>
          <Label>Email</Label>
          <Input {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <Label>City</Label>
          <Input {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>

        <div>
          <Label>Property Type</Label>
          <Input {...register("propertyType")} />
          {errors.propertyType && <p className="text-sm text-red-500">{errors.propertyType.message}</p>}
        </div>

        {["Apartment", "Villa"].includes(propertyType ?? "") && (
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
                    <SelectItem value="One">1</SelectItem>
                    <SelectItem value="Two">2</SelectItem>
                    <SelectItem value="Three">3</SelectItem>
                    <SelectItem value="Four">4</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bhk && <p className="text-sm text-red-500">{errors.bhk.message}</p>}
          </div>
        )}

        <div>
          <Label>Purpose</Label>
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.purpose && <p className="text-sm text-red-500">{errors.purpose.message}</p>}
        </div>

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

        <div>
          <Label>Tags (comma separated)</Label>
          <Input {...register("tags")} placeholder="e.g. NRI,Investor" />
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea {...register("notes")} />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </form>
    </div>
  )
}
