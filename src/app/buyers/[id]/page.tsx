"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller} from "react-hook-form"
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
import { toast } from "sonner"
import { HashLoader } from "react-spinners"
import { Save, Trash, X } from "lucide-react"

type BuyerFormData = z.infer<typeof buyerSchema>

export default function EditBuyerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const predefinedTags = ["Investor", "NRI", "Luxury", "Urgent", "Budget", "First-time"]
  const tagInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: { tags: [] },
  })

  const [tags, setTags] = useState<string[]>([])
  const addTag = (tag: string) => {
    const cleanTag = tag.trim()
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag])
    }
  }
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const propertyType = watch("propertyType")

  useEffect(() => {
    async function checkAuthAndFetch() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace("/login")
          return
        }

        const res = await fetch(`/api/buyers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch buyer")

        const { buyer } = await res.json()

        const formatted = {
          ...buyer,
          bhk: buyer.bhk ?? "",
          tags: (buyer.tags || []).map((value: string) => ({ value })),
        }

        reset(formatted)
      } catch (err: any) {
        toast.error(err.message || "Failed to load buyer data")
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

      const transformedData = {
        ...data,
        tags,
      }

      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transformedData),
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update buyer")
      }

      toast.success("Buyer updated successfully!")
      router.push("/buyers")
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes")
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

      toast.success("Buyer deleted successfully!")
      router.push("/buyers")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete buyer")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <HashLoader color="#2563eb" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-extrabold mb-8 border-b pb-3 text-blue-400">Edit Buyer Lead</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-1">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="grid gap-1">
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
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>

        <div className="grid gap-1">
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
          {errors.propertyType && <p className="text-sm text-red-500">{errors.propertyType.message}</p>}
        </div>

        {["Apartment", "Villa"].includes(propertyType ?? "") && (
          <div className="grid gap-1">
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
            {errors.bhk && <p className="text-sm text-red-600">{errors.bhk.message}</p>}
          </div>
        )}

        <div className="grid gap-1">
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
          {errors.purpose && <p className="text-sm text-red-600">{errors.purpose.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="budgetMin">Minimum Budget</Label>
          <Input
            id="budgetMin"
            type="number"
            {...register("budgetMin", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.budgetMin && <p className="text-sm text-red-600">{errors.budgetMin.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="budgetMax">Maximum Budget</Label>
          <Input
            id="budgetMax"
            type="number"
            {...register("budgetMax", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
          {errors.budgetMax && <p className="text-sm text-red-600">{errors.budgetMax.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <Input
            ref={tagInputRef}
            id="tags"
            placeholder="Type and press enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const inputValue = e.currentTarget.value
                addTag(inputValue)
                e.currentTarget.value = ""
              }
            }}
          />

          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {predefinedTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={isSubmitting} className="hover:bg-transparent border-2 font-semi  bold cursor-pointer hover:text-blue-500 border-blue-500 bg-blue-400 text-white">
            <Save /> {isSubmitting ? "Saving..." : "Save Lead"}
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-transparent border-2 font-semi  bold cursor-pointer text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash /> {deleting ? "Deleting..." : "Delete Lead"}
          </Button>
        </div>
      </form>
    </div>
    </div>
  )
}
