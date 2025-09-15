import { ClientOnly } from "@/components/ClientOnly"
import BuyersClientPage from "./BuyersClientPage"

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <ClientOnly fallback={<div className="p-8 text-center">Loading buyers...</div>}>
      <BuyersClientPage />
    </ClientOnly>
  )
}