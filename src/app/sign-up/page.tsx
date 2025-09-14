"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError(null)

    if (!name || !email || !phone || !password) {
      toast.error("All fields are required")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      toast.error("Signup successful, but no active session. Please check your email to confirm.")
      setLoading(false)
      return
    }

    try {
      const session = await supabase.auth.getSession()
      const accessToken = session?.data.session?.access_token

      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({user: data.user}),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || "Failed to sync user")
        setLoading(false)
        return
      }

      toast.success("Sign up successful!")
      router.push("/buyers")
    } catch (syncError) {
      toast.error("Failed to sync user")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-xs">  
      <h1 className="text-3xl mb-6 text-blue-400 font-semibold">Sign Up</h1>

      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">Name</label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className="block mb-1">Phone</label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block mb-1">Password</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
        />
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <Button onClick={handleSignup} disabled={loading} className="cursor-pointer flex items-center justify-center gap-2 hover:bg-transparent border-2 border-blue-400 hover:text-blue-400 bg-blue-400 font-semibold">
        {loading && <Loader2 className="animate-spin h-4 w-4" />}
        {loading ? "Signing up..." : "Sign Up"}
      </Button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </p>
      </div>
    </div>
    </div>
  )
}
