"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ExportBuyersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const getToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        setAccessToken(session.access_token)
      } else {
        router.push("/login?redirect=/buyers")
      }
    }

    getToken()
  }, [router])

  useEffect(() => {
    if (!accessToken) return

    const exportCsv = async () => {
      const params = searchParams.toString()
      const res = await fetch(`/api/buyers/export?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!res.ok) {
        alert("Failed to export buyers")
        router.push("/buyers")
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "buyers.csv"
      a.click()
      window.URL.revokeObjectURL(url)

      router.push("/buyers")
    }

    exportCsv()
  }, [accessToken, searchParams, router])

  return (
    <div className="p-8 text-center">
      <p className="text-lg font-medium">Preparing CSV export...</p>
    </div>
  )
}
