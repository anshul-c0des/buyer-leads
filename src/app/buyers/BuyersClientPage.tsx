"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { HashLoader, PulseLoader } from "react-spinners";
import { toast } from "sonner";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Eye,
  FolderDown,
  FolderUp,
  Pencil,
} from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Filters = {   // defines the filter fields used for querying leads
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  search?: string;
  page?: number;
};

const PAGE_SIZE = 10;   // number of leads to show per page

export default function BuyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({   // holds current filter values, initialized from URL
    city: searchParams.get("city") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
    status: searchParams.get("status") ?? "",
    timeline: searchParams.get("timeline") ?? "",
    search: searchParams.get("search") ?? "",
    page: Number(searchParams.get("page") ?? "1"),
  });

  const [debouncedSearch] = useDebounce(filters.search, 500);   // debounced search term

  const [buyersData, setBuyersData] = useState<{   // stores fetched buyers data + pagination metadata
    buyers: any[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);   // loading state
  const [isPending, startTransition] = useTransition();   // smooth UI updates
  const [currentUser, setCurrentUser] = useState<{   // stores current user info
    id: string;
    role: string;
  } | null>(null);

  useEffect(() => {   // fetches + listens for current user changes 
    async function fetchCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCurrentUser(data?.id ? data : null);
    }

    fetchCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {   // Subscribes to update currentUser on logout
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        router.refresh();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  useEffect(() => {   // fetches buyers data on search change
    async function fetchBuyers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.city) params.append("city", filters.city);
        if (filters.propertyType)
          params.append("propertyType", filters.propertyType);
        if (filters.status) params.append("status", filters.status);
        if (filters.timeline) params.append("timeline", filters.timeline);
        if (debouncedSearch) params.append("search", debouncedSearch);
        params.append("page", String(filters.page ?? 1));
        params.append("pageSize", String(PAGE_SIZE));

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`/api/buyers?${params.toString()}`, {
          headers,
        });

        if (!res.ok) {
          const errorText = await res.text();
          toast.error(`Failed to fetch buyers: ${res.status} ${errorText}`);
          setBuyersData(null);
          return;
        }

        const data = await res.json();
        setBuyersData(data);
      } catch {
        toast.error("Error fetching buyers data. Please try again.");
        setBuyersData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBuyers();
  }, [
    filters.city,
    filters.propertyType,
    filters.status,
    filters.timeline,
    debouncedSearch,
    filters.page,
  ]);

  function updateFilters(updated: Partial<Filters>) {   // Upates filter, resets page, and updates URL query params
    const newFilters = { ...filters, ...updated, page: 1 };

    for (const key of ["city", "propertyType", "status", "timeline"] as const) {   // all selection -> empty string
      if (newFilters[key] === "all") newFilters[key] = "";
    }

    setFilters(newFilters);

    const params = new URLSearchParams();
    for (const key in newFilters) {
      const val = newFilters[key as keyof Filters];
      if (val) params.append(key, String(val));
    }

    startTransition(() => {
      const newUrl = `/buyers?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    });
  }

  function goToPage(newPage: number) {   // handles pagination
    if (newPage < 1 || (buyersData && newPage > buyersData.totalPages)) return;
    updateFilters({ page: newPage });
  }

  const timelineLabels: Record<string, string> = {   // timeline filter mapping
    ZeroToThreeMonths: "0-3 months",
    ThreeToSixMonths: "3-6 months",
    MoreThanSixMonths: ">6 months",
    Exploring: "Exploring",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <HashLoader color="#2563eb" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className=" bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-2">
            <h1 className="text-4xl font-semibold text-blue-400">Leads</h1>
            <p className="text-muted-foreground text-sm">
              Manage your buyer leads with filters, search and actions.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end mt-6 mb-8">
            <Input  // Search bar
              placeholder="Search by name, phone, email"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="min-w-[200px]"
            />

            <Select   // City Filter
              value={filters.city}
              onValueChange={(val) => updateFilters({ city: val })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                <SelectItem value="Mohali">Mohali</SelectItem>
                <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                <SelectItem value="Panchkula">Panchkula</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select   // Property Type Filter
              value={filters.propertyType}
              onValueChange={(val) => updateFilters({ propertyType: val })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>

            <Select   // Status Filter
              value={filters.status}
              onValueChange={(val) => updateFilters({ status: val })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Visited">Visited</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>

            <Select   // Timeline Filter
              value={filters.timeline}
              onValueChange={(val) => updateFilters({ timeline: val })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ZeroToThreeMonths">0-3m</SelectItem>
                <SelectItem value="ThreeToSixMonths">3-6m</SelectItem>
                <SelectItem value="MoreThanSixMonths">&gt;6m</SelectItem>
                <SelectItem value="Exploring">Exploring</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              {/* Import CSV */}
              <Button
                onClick={() => router.push("/buyers/import")}
                className="cursor-pointer flex items-center justify-center gap-2 hover:bg-transparent border-2 border-blue-400 hover:text-blue-400 bg-blue-400 font-semibold"
              >
                <FolderDown />
                Import
              </Button>
              {/* Export CSV */}
              <Button
                onClick={() =>
                  router.push(`/buyers/export${window.location.search}`)
                }
                className="cursor-pointer flex items-center justify-center gap-1 hover:bg-transparent border-2 border-blue-400 hover:text-blue-400 bg-blue-400 font-semibold"
              >
                <FolderUp />
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto shadow-sm">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className=" text-sm text-gray-500 bg-blue-50">
                  {[
                    "Name",
                    "Phone",
                    "City",
                    "Property Type",
                    "BHK",
                    "Budget",
                    "Timeline",
                    "Status",
                    "Updated",
                    "Actions",
                  ].map((label, i) => (
                    <th key={i} className="p-2 border-r text-left">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-6">
                      <div className="flex justify-center">
                        <PulseLoader color="#2563eb" />
                      </div>
                    </td>
                  </tr>
                ) : buyersData?.buyers?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No buyers found.
                    </td>
                  </tr>
                ) : (
                  buyersData?.buyers.map((buyer) => (
                    <tr
                      key={buyer.id}
                      className="border-b border-muted hover:bg-blue-50/40 text-gray-700"
                    >
                      <td className="p-2 border-r border-muted">
                        {buyer.fullName}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {buyer.phone}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {buyer.city}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {buyer.propertyType}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {["Apartment", "Villa"].includes(
                          buyer.propertyType ?? ""
                        )
                          ? buyer.bhk ?? "-"
                          : "-"}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {buyer.budgetMin ?? "-"} - {buyer.budgetMax ?? "-"}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {timelineLabels[buyer.timeline] ?? buyer.timeline}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {buyer.status}
                      </td>
                      <td className="p-2 border-r border-muted">
                        {new Date(buyer.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-2 flex gap-1">
                        {(currentUser?.role === "ADMIN" ||
                          currentUser?.id === buyer.ownerId) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/buyers/${buyer.id}`)}
                            className="hover:text-blue-400 border hover:border-blue-400 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/buyers/${buyer.id}/view`)
                          }
                          className="hover:text-blue-400 border hover:border-blue-400 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <Button
              onClick={() => goToPage((filters.page ?? 1) - 1)}
              disabled={(filters.page ?? 1) <= 1}
              size="icon"
              variant="secondary"
              className="bg-blue-50 hover:bg-blue-100 rounded-full"
            >
              <ChevronLeftIcon />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page} of {buyersData?.totalPages ?? 1}
            </span>
            <Button
              onClick={() => goToPage((filters.page ?? 1) + 1)}
              disabled={(filters.page ?? 1) >= (buyersData?.totalPages ?? 1)}
              size="icon"
              variant="secondary"
              className="bg-blue-50 hover:bg-blue-100 rounded-full"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
