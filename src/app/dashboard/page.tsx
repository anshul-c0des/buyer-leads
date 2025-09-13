"use client"

import { useEffect, useState } from "react"

export default function Dashboard() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBuyers() {
      const res = await fetch("/api/my-leads")
      const data = await res.json()
      setBuyers(data.buyers || [])
      setLoading(false)
    }

    fetchBuyers()
  }, [])

  if (loading) return <div>Loading your buyers...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
      {buyers.length === 0 ? (
        <p>No buyers yet.</p>
      ) : (
        <ul className="space-y-2">
          {buyers.map((buyer: any) => (
            <li key={buyer.id} className="border p-3 rounded">
              <div><strong>Name:</strong> {buyer.fullName}</div>
              <div><strong>Phone:</strong> {buyer.phone}</div>
              <div><strong>City:</strong> {buyer.city}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
