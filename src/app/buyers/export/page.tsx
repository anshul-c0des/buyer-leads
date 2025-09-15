import { ClientOnly } from "@/components/ClientOnly";
import ExportBuyersPage from "./ExportBuyersPage";
import { HashLoader } from "react-spinners";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ClientOnly
      fallback={<div className="min-h-screen flex items-center justify-center gap-1"><HashLoader color="#2563eb" /></div>}
    >
      <ExportBuyersPage />
    </ClientOnly>
  );
}
