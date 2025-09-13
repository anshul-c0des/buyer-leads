import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  return dbUser
}
