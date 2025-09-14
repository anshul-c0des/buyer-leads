"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError(null)

    if (!email || !password) {
      toast.error("Email and password are required!")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      toast.error("Login succeeded but no active session found")
      setLoading(false)
      return
    }

    try {
      const accessToken = data.session?.access_token;
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ user: data.user }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to sync user")
        setLoading(false)
        return
      }

      toast.success("Logged in successfully!")
      router.push("/buyers")
    } catch {
      toast.error("Failed to sync user")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-6">Login</h1>

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

      <Button onClick={handleLogin} disabled={loading} className="cursor-pointer flex items-center justify-center gap-2">
        {loading && <Loader2 className="animate-spin h-4 w-4" />}
        {loading ? "Logging in..." : "Login"}
      </Button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Don’t have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600"
            onClick={() => router.push("/sign-up")}
          >
            Sign up
          </Button>
        </p>
      </div>

    </div>
  )
}
