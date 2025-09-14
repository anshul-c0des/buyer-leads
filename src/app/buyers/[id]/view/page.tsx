"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { HashLoader } from "react-spinners"

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
        if (!buyerRes.ok) toast.error("Failed to fetch buyer details");
        const buyerData = await buyerRes.json();

        const historyRes = await fetch(`/api/buyer_history?buyerId=${id}&limit=5&sort=desc`);
        if (!historyRes.ok) toast.error("Failed to fetch buyer history");
        const historyData = await historyRes.json();

        setBuyer(buyerData.buyer);
        setHistory(historyData.history);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <HashLoader color="#2563eb" />
      </div>
    )

  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-red-600 font-semibold">
        {error}
      </div>
    )

  if (!buyer)
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-600 font-medium">
        Buyer not found
      </div>
    )

  function renderDiff(before: any, after: any) {
    const fields = Object.keys({ ...before, ...after })
    return fields.map((field) => {
      if (before[field] === after[field]) return null

      return (
        <div key={field} className="mb-1 text-sm">
          <span className="font-semibold capitalize">{field}:</span>{" "}
          <span className="line-through text-red-500">{String(before[field]) || "-"}</span>{" "}
          <span className="text-green-600">→ {String(after[field]) || "-"}</span>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-md shadow-md">
      <h1 className="text-3xl font-extrabold mb-6 border-b pb-2">
        Buyer Name: <span className="text-blue-400">{buyer.fullName}</span>
      </h1>

      {/* Buyer Info */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b pb-6">
        <div className="space-y-2">
          <p>
            <span className="font-bold text-blue-400/80">Phone:</span> {buyer.phone}
          </p>
          <p>
            <span className="font-bold text-blue-400/80">Email:</span> {buyer.email ?? "-"}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <span className="font-bold text-blue-400/80">Last Updated:</span>{" "}
            {new Date(buyer.updatedAt).toLocaleString()}
          </p>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Changes Made (Last 5)</h2>

        {history.length === 0 ? (
          <p className="text-gray-500 italic">No change history available.</p>
        ) : (
          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
            {history.map((record) => (
              <div
                key={record.id}
                className="border rounded-md p-4 bg-gray-50 shadow-sm"
              >
                <p className="mb-1">
                  <span className="font-semibold">Changed By:</span> {record.changedBy}
                </p>
                <p className="mb-3 text-sm text-gray-600">
                  <span className="font-semibold">Timestamp:</span>{" "}
                  {new Date(record.changedAt).toLocaleString()}
                </p>
                <div className="text-sm">{renderDiff(record.diff.before, record.diff.after)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Back Button */}
      <div className="pt-4 border-t">
        <Button onClick={() => router.back()} variant="outline" className="cursor-pointer text-blue-500 border-blue-500 hover:text-blue-500">
          Back
        </Button>
      </div>
    </div>
    </div>
  )
}
