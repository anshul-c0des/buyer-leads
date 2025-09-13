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
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUser({ email: user.email, initial: user.email.charAt(0).toUpperCase() })
      } else {
        setUser(null)
      }
    }
    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email, initial: session.user.email.charAt(0).toUpperCase() })
      } else {
        setUser(null)
      }
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

      <div>
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
