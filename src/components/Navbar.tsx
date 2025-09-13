"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string | null; initial: string | null } | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
    
      if (!token) return setUser(null)
    
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
    
      if (!res.ok) return setUser(null)
    
      const data = await res.json()
      const name = data.name || data.email || "?"
    
      setUser({
        email: data.email,
        initial: name.charAt(0).toUpperCase(),
      })
    } 
    
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/buyers")
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
      <Link href="/">
        <h1 className="text-xl font-bold cursor-pointer">Buyer Base</h1>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <Button variant="secondary" onClick={() => router.push("/buyers/new")}>
            Add Buyer
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold"
              >
                {user.initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push("/login")}>Login</Button>
        )}
      </div>
    </nav>
  )
}
