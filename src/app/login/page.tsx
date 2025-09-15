"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");   // user's email
  const [password, setPassword] = useState("");   // password
  const [error, setError] = useState<string | null>(null);   // catches errors
  const [loading, setLoading] = useState(false);   // loading state

  async function handleLogin() {   // handles user login
    setLoading(true);
    setError(null);

    if (!email || !password) {   // basic validation
      toast.error("Email and password are required!");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({   // calls supabase sign in method
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      toast.error("Login succeeded but no active session found");
      setLoading(false);
      return;
    }

    try {
      const accessToken = data.session?.access_token;
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user: data.user }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to sync user");
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!");
      router.push("/buyers");
    } catch {
      toast.error("Failed to sync user");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-xs">
        <h1 className="text-3xl mb-6 text-blue-400 font-semibold">Login</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="cursor-pointer flex items-center justify-center gap-2 hover:bg-transparent border-2 border-blue-400 hover:text-blue-400 bg-blue-400 font-semibold"
        >
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
    </div>
  );
}
