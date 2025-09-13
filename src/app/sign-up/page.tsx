"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
      setError("All fields are required")
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
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError("Signup successful, but no active session. Please check your email to confirm.")
      setLoading(false)
      return
    }

    try {
      const session = await supabase.auth.getSession()
      const accessToken = session?.data.session?.access_token

      console.log(accessToken);
      

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

      router.push("/buyers")
    } catch (syncError) {
      setError("Failed to sync user")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-6">Sign Up</h1>

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

      <Button onClick={handleSignup} disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </div>
  )
}
