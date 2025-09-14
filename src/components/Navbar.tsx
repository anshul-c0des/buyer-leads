"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { BadgePlus, LayoutDashboard, LogOut, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string | null; initial: string | null } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
  
        if (!token) {
          setUser(null)
          return
        }
  
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
  
        if (!res.ok) {
          setUser(null)
          return
        }
  
        const data = await res.json()
        const name = data.name || data.email || "?"
  
        setUser({
          email: data.email,
          initial: name.charAt(0).toUpperCase(),
        })
      } catch (err) {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }
  
    fetchUser()
  
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
    toast.success("Logged out successfully!")
  }

  const onLoginPage = pathname === "/login"
  const onSignupPage = pathname === "/sign-up"

  const showBackButton = pathname !== "/buyers"

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}


          <Link href="/buyers">
            <div className="flex items-center gap-1 cursor-pointer">
              <Image src="/logo.png" alt="BuyerBase Logo" width={35} height={35} />
              <h1 className="text-xl font-bold">Buyer Base</h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Button variant="secondary" className="cursor-pointer" onClick={() => router.push("/buyers/new")}>
              <BadgePlus /> Add Lead
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User menu"
                  className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold cursor-pointer"
                >
                  {user.initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-700">
                  <LogOut className="text-current group-hover:text-red-800" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {onLoginPage && (
                <Button className="cursor-pointer" onClick={() => router.push("/sign-up")}>
                  Sign Up
                </Button>
              )}
              {onSignupPage && (
                <Button className="cursor-pointer" onClick={() => router.push("/login")}>
                  Login
                </Button>
              )}
              {!onLoginPage && !onSignupPage && (
                <Button className="cursor-pointer" onClick={() => router.push("/login")}>
                  Login
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
