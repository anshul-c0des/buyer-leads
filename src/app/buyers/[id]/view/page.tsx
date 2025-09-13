"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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

type BuyerHistoryRecord = {
  id: string
  changedBy: string
  changedAt: string
  diff: {
    before: Partial<Buyer>
    after: Partial<Buyer>
  }
}

export default function BuyerViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [history, setHistory] = useState<BuyerHistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return;
  
    async function fetchData() {
      setLoading(true);
      setError(null);
  
      try {
        const buyerRes = await fetch(`/api/buyers/${id}`);
        if (!buyerRes.ok) throw new Error("Failed to fetch buyer details");
        const buyerData = await buyerRes.json();
  
        const historyRes = await fetch(`/api/buyer_history?buyerId=${id}&limit=5&sort=desc`);
        if (!historyRes.ok) throw new Error("Failed to fetch buyer history");
        const historyData = await historyRes.json();
  
        console.log("History data:", historyData.history);
  
        setBuyer(buyerData.buyer);
        setHistory(historyData.history);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, [id]);
  

  if (loading) return <div>Loading buyer details...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!buyer) return <div>Buyer not found</div>

  function renderDiff(before: any, after: any) {
    const fields = Object.keys({ ...before, ...after })
    return fields.map((field) => {
      if (before[field] === after[field]) return null

      return (
        <div key={field} className="mb-1">
          <strong>{field}:</strong> {String(before[field])} → {String(after[field])}
        </div>
      )
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buyer Details: {buyer.fullName}</h1>

      {/* Buyer Info (readonly) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div><strong>Phone:</strong> {buyer.phone}</div>
        <div><strong>Email:</strong> {buyer.email ?? "-"}</div>
        <div><strong>Last Updated:</strong> {new Date(buyer.updatedAt).toLocaleString()}</div>
      </div>

      {/* History */}
      <h2 className="text-xl font-semibold mb-4">Change History (Last 5)</h2>

      {history.length === 0 ? (
        <p>No change history available.</p>
      ) : (
        <div className="space-y-6">
          {history.map((record) => (
            <div
              key={record.id}
              className="border p-4 rounded shadow-sm bg-gray-50"
            >
              <div className="mb-2">
                <strong>Changed By:</strong> {record.changedBy}
              </div>
              <div className="mb-2">
                <strong>Timestamp:</strong>{" "}
                {new Date(record.changedAt).toLocaleString()}
              </div>
              <div>
                {renderDiff(record.diff.before, record.diff.after)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button onClick={() => router.back()}>Back</Button>
      </div>
    </div>
  )
}
