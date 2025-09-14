"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<{ name: string, email: string, phone: string } | null>(null)

  useEffect(() => {
    async function fetchUserAndBuyers() {
      const sessionRes = await supabase.auth.getSession()
      const session = sessionRes.data.session
  
      if (!session) {
        console.warn("No session found – user is not logged in")
        setLoading(false)
        return
      }
  
      const accessToken = session.access_token
  
      const userRes = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
  
      if (!userRes.ok) {
        console.warn("Failed to fetch user details")
        setLoading(false)
        return
      }
  
      const userInfo = await userRes.json()
  
      setUserDetails({
        name: userInfo.name || "No Name", 
        email: userInfo.email || "No Email",
        phone: userInfo.phone || "No Phone",
      })
  
      const res = await fetch("/api/my-leads", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
  
      const data = await res.json()
      setBuyers(data.buyers || [])
      setLoading(false)
    }
  
    fetchUserAndBuyers()
  }, [])  
  

  if (loading) return <div className="p-6">Loading your dashboard...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {userDetails?.name} 👋</h1>
      <p className="mb-2 text-gray-600">📧 {userDetails?.email}</p>
      <p className="mb-4 text-gray-600">📞 {userDetails?.phone}</p>

      <h2 className="text-xl font-semibold mb-2">Your Leads</h2>

      {buyers.length === 0 ? (
        <p>No buyers yet.</p>
      ) : (
        <ul className="space-y-2">
          {buyers.map((buyer: any) => (
            <li key={buyer.id} className="border p-3 rounded">
              <div><strong>Name:</strong> {buyer.name}</div>
              <div><strong>Phone:</strong> {buyer.phone}</div>
              <div><strong>City:</strong> {buyer.city}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
