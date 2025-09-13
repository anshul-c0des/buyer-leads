"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent,SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Buyer = {
  id: string
  fullName: string
  phone: string
  email?: string
  city?: string
  propertyType?: string
  bhk?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  timeline?: string | null
  status?: string | null
  source?: string | null
  tags?: string[]
  updatedAt: string
}

export default function BuyerEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<Buyer>>({})

  // Fetch buyer on mount
  useEffect(() => {
    if (!id) return
    async function fetchBuyer() {
      setLoading(true)
      try {
        const res = await fetch(`/api/buyers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch buyer")
        const data = await res.json()
        setBuyer(data.buyer)
        setFormData(data.buyer)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [id])

  function onChange(field: keyof Buyer, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Sanitize formData for enums (convert "" to null)
      const payload = {
        ...formData,
        bhk: formData.bhk || undefined,
        timeline: formData.timeline === "" ? null : formData.timeline,
        status: formData.status === "" ? null : formData.status,
        source: formData.source === "" ? null : formData.source,
      }

      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save")
      }

      router.back()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this buyer? This action cannot be undone.")) {
      return
    }
  
    setDeleting(true)
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
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

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!buyer) return <div>Buyer not found</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Buyer: {buyer.fullName}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={formData.fullName || ""}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
        />

        <Input
          placeholder="Phone"
          value={formData.phone || ""}
          onChange={(e) => onChange("phone", e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          value={formData.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
        />

        <Input
          placeholder="City"
          value={formData.city || ""}
          onChange={(e) => onChange("city", e.target.value)}
        />

        <Input
          placeholder="Property Type"
          value={formData.propertyType || ""}
          onChange={(e) => onChange("propertyType", e.target.value)}
        />

        {/* BHK Select */}
        <Select
          value={formData.bhk || ""}
          onValueChange={(val) => onChange("bhk", val === "" ? null : val)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="Studio">Studio</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>

        {/* Budget Min */}
        <Input
          type="number"
          placeholder="Budget Min"
          value={formData.budgetMin ?? ""}
          onChange={(e) =>
            onChange("budgetMin", e.target.value ? Number(e.target.value) : null)
          }
        />

        {/* Budget Max */}
        <Input
          type="number"
          placeholder="Budget Max"
          value={formData.budgetMax ?? ""}
          onChange={(e) =>
            onChange("budgetMax", e.target.value ? Number(e.target.value) : null)
          }
        />

        {/* Timeline Select */}
        <Select
          value={formData.timeline || ""}
          onValueChange={(val) => onChange("timeline", val === "" ? null : val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="ZeroToThreeMonths">0-3 Months</SelectItem>
            <SelectItem value="ThreeToSixMonths">3-6 Months</SelectItem>
            <SelectItem value="MoreThanSixMonths">6+ Months</SelectItem>
            <SelectItem value="Exploring">Exploring</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={formData.status || ""}
          onValueChange={(val) => onChange("status", val === "" ? null : val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Interested">Interested</SelectItem>
            <SelectItem value="NotInterested">Not Interested</SelectItem>
          </SelectContent>
        </Select>

        {/* Source Select */}
        <Select
          value={formData.source || ""}
          onValueChange={(val) => onChange("source", val === "" ? null : val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="WalkIn">Walk-in</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="destructive"
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Buyer'}
        </Button>


        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  )
}
