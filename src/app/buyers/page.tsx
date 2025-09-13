"use client"

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Filters = {
  city?: string
  propertyType?: string
  status?: string
  timeline?: string
  search?: string
  page?: number
}

const PAGE_SIZE = 10

export default function BuyersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract query params for filters
  const [filters, setFilters] = useState<Filters>({
    city: searchParams.get('city') ?? '',
    propertyType: searchParams.get('propertyType') ?? '',
    status: searchParams.get('status') ?? '',
    timeline: searchParams.get('timeline') ?? '',
    search: searchParams.get('search') ?? '',
    page: Number(searchParams.get('page') ?? '1'),
  })

  // Debounce search to reduce API calls
  const [debouncedSearch] = useDebounce(filters.search, 500)

  const [buyersData, setBuyersData] = useState<{
    buyers: any[]
    total: number
    page: number
    totalPages: number
  } | null>(null)

  const [isPending, startTransition] = useTransition()

  // Fetch buyers data whenever filters or debounced search changes
  useEffect(() => {
    async function fetchBuyers() {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.propertyType) params.append('propertyType', filters.propertyType)
      if (filters.status) params.append('status', filters.status)
      if (filters.timeline) params.append('timeline', filters.timeline)
      if (debouncedSearch) params.append('search', debouncedSearch)
      params.append('page', String(filters.page ?? 1))

      const res = await fetch(`/api/buyers?${params.toString()}`)
      const data = await res.json()
      setBuyersData(data)
    }
    fetchBuyers()
  }, [filters.city, filters.propertyType, filters.status, filters.timeline, debouncedSearch, filters.page])

  // Update URL and filters when user changes filter/search/page
  function updateFilters(updated: Partial<Filters>) {
    const newFilters = { ...filters, ...updated, page: 1 } // reset page to 1 on filter change

    // Convert 'all' to empty string to disable filter
    for (const key of ['city', 'propertyType', 'status', 'timeline'] as const) {
      if (newFilters[key] === 'all') {
        newFilters[key] = ''
      }
    }

    setFilters(newFilters)

    const params = new URLSearchParams()
    if (newFilters.city) params.append('city', newFilters.city)
    if (newFilters.propertyType) params.append('propertyType', newFilters.propertyType)
    if (newFilters.status) params.append('status', newFilters.status)
    if (newFilters.timeline) params.append('timeline', newFilters.timeline)
    if (newFilters.search) params.append('search', newFilters.search)
    params.append('page', String(newFilters.page ?? 1))

    startTransition(() => {
      router.replace(`/buyers?${params.toString()}`)
    })
  }

  // Pagination controls
  function goToPage(newPage: number) {
    if (newPage < 1 || (buyersData && newPage > buyersData.totalPages)) return
    updateFilters({ page: newPage })
  }

  const timelineLabels: Record<string, string> = {
    ZeroToThreeMonths: '0-3 months',
    ThreeToSixMonths: '3-6 months',
    MoreThanSixMonths: '>6 months',
    Exploring: 'Exploring',
  }  

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buyer Leads</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name, phone, email"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="min-w-[200px]"
        />

        <Select
          value={filters.city}
          onValueChange={(val) => updateFilters({ city: val })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
            <SelectItem value="Mohali">Mohali</SelectItem>
            <SelectItem value="Zirakpur">Zirakpur</SelectItem>
            <SelectItem value="Panchkula">Panchkula</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.propertyType}
          onValueChange={(val) => updateFilters({ propertyType: val })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Plot">Plot</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(val) => updateFilters({ status: val })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Visited">Visited</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.timeline}
          onValueChange={(val) => updateFilters({ timeline: val })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ZeroToThreeMonths">0-3m</SelectItem>
            <SelectItem value="ThreeToSixMonths">3-6m</SelectItem>
            <SelectItem value="MoreThanSixMonths">&gt;6m</SelectItem>
            <SelectItem value="Exploring">Exploring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Phone</th>
            <th className="border border-gray-300 p-2 text-left">City</th>
            <th className="border border-gray-300 p-2 text-left">Property Type</th>
            <th className="border border-gray-300 p-2 text-left">Budget (Min-Max)</th>
            <th className="border border-gray-300 p-2 text-left">Timeline</th>
            <th className="border border-gray-300 p-2 text-left">Status</th>
            <th className="border border-gray-300 p-2 text-left">Updated At</th>
            <th className="border border-gray-300 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buyersData?.buyers.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-4">
                No buyers found.
              </td>
            </tr>
          )}

          {buyersData?.buyers.map((buyer) => (
            <tr key={buyer.id} className="hover:bg-gray-100 cursor-pointer">
              <td className="border border-gray-300 p-2">{buyer.fullName}</td>
              <td className="border border-gray-300 p-2">{buyer.phone}</td>
              <td className="border border-gray-300 p-2">{buyer.city}</td>
              <td className="border border-gray-300 p-2">{buyer.propertyType}</td>
              <td className="border border-gray-300 p-2">
                {buyer.budgetMin ?? '-'} - {buyer.budgetMax ?? '-'}
              </td>
              <td className="border border-gray-300 p-2">{timelineLabels[buyer.timeline] ?? buyer.timeline}</td>
              <td className="border border-gray-300 p-2">{buyer.status}</td>
              <td className="border border-gray-300 p-2">
                {new Date(buyer.updatedAt).toLocaleString()}
              </td>
              <td className="border border-gray-300 p-2">
                <Button size="sm" onClick={() => router.push(`/buyers/${buyer.id}`)}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => router.push(`/buyers/${buyer.id}/view`)}>
                  View
                </Button>
                  </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <Button
          onClick={() => goToPage((filters.page ?? 1) - 1)}
          disabled={(filters.page ?? 1) <= 1 || isPending}
        >
          Previous
        </Button>
        <span>
          Page {filters.page} of {buyersData?.totalPages ?? 1}
        </span>
        <Button
          onClick={() => goToPage((filters.page ?? 1) + 1)}
          disabled={
            (filters.page ?? 1) >= (buyersData?.totalPages ?? 1) || isPending
          }
        >
          Next
        </Button>
      </div>
    </div>
  )
}
