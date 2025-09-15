import { ClientOnly } from "@/components/ClientOnly"
import ExportBuyersPage from "./ExportBuyersPage"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <ClientOnly fallback={<div className="p-8 text-center">Preparing CSV export...</div>}>
      <ExportBuyersPage />
    </ClientOnly>
  )
}
