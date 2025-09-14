"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Pencil, Eye, Loader2 } from "lucide-react"
import { HashLoader } from "react-spinners"

export default function Dashboard() {
  const router = useRouter()

  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userDetails, setUserDetails] = useState<{ name: string, email: string, phone: string, id?: string, role?: string } | null>(null)

  async function fetchUserAndBuyers(isInitial = false) {
    if(isInitial) setLoading(true)
      else setRefreshing(true); 
    try {
      const sessionRes = await supabase.auth.getSession()
      const session = sessionRes.data.session
  
      if (!session) {
        toast.error("Please login to view your dashboard.")
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
        toast.error("Failed to fetch user details.")
        return
      }
  
      const userInfo = await userRes.json()
  
      setUserDetails({
        name: userInfo.name || "No Name",
        email: userInfo.email || "No Email",
        phone: userInfo.phone || "No Phone",
        id: userInfo.id,
        role: userInfo.role,
      })
  
      const res = await fetch("/api/my-leads", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
  
      if (!res.ok) {
        toast.error("Failed to load your leads.")
        setBuyers([])
        return
      }
  
      const data = await res.json()
      setBuyers(data.buyers || [])
      console.log(data.buyers);
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setBuyers([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserAndBuyers(true)
  }, [])

  const handleRefresh = () => { 
    fetchUserAndBuyers(false)
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
      <div className="max-w-5xl mx-auto p-6 space-y-6 bg-white rounded-md shadow-xs" >
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, <span className="text-blue-400">{userDetails?.name}</span> 👋</h1>
            <div className="mt-1 text-gray-700 space-y-1 font-medium">
              <p>📧 <a href={`mailto:${userDetails?.email}`} className="hover:underline">{userDetails?.email}</a></p>
              <p>📞 {userDetails?.phone}</p>
            </div>
          </div>
          <Button className="text-blue-500 bg-transparent border-2  bold cursor-pointer hover:text-white border-blue-500 hover:bg-blue-400" onClick={handleRefresh} >
            {refreshing && <Loader2 className="animate-spin h-4 w-4" />}
            {refreshing ? "Refreshing..." : "Refresh Leads"}
          </Button>
        </header>

        {/* Leads Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Your Leads</h2>

          {buyers.length === 0 ? (
            <p className="text-gray-500">You currently have no buyers. Start adding some leads!</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {buyers.map((buyer: any) => (
                <li
                  key={buyer.id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
                >
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <p><strong>Name:</strong> {buyer.fullName}</p>
                    <p><strong>Phone:</strong> {buyer.phone}</p>
                    <p><strong>Property type:</strong> {buyer.propertyType}</p>
                    <p><strong>Purpose:</strong> {buyer.purpose}</p>
                    <p><strong>City:</strong> {buyer.city}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* Edit button shows only if user is ADMIN or owner */}
                    {(userDetails?.role === "ADMIN" || userDetails?.id === buyer.ownerId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:text-blue-400 border hover:border-blue-400 cursor-pointer"
                        onClick={() => router.push(`/buyers/${buyer.id}`)}
                        aria-label={`Edit lead ${buyer.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}

                    {/* View button always visible */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:text-blue-400 border hover:border-blue-400 cursor-pointer"
                      onClick={() => router.push(`/buyers/${buyer.id}/view`)}
                      aria-label={`View lead ${buyer.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
