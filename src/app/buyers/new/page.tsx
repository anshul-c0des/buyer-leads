"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema } from "@/lib/zod/buyerSchema";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { HashLoader } from "react-spinners";
import { BadgePlus, X } from "lucide-react";

type FormData = z.infer<typeof buyerSchema>;   // Infer form data types

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const predefinedTags = [   // predefined tags
    "Investor",
    "NRI",
    "Luxury",
    "Urgent",
    "Budget",
    "First-time",
  ];

  const tagInputRef = useRef<HTMLInputElement | null>(null);   // Ref for input field to manage tags

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: { tags: [] },   // tags as empty array
  });

  const [tags, setTags] = useState<string[]>([]);   // state to manage tags added by user

  const addTag = (tag: string) => {   // adds a tag to tag array if it's non-empty and unique
    const cleanTag = tag.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
  };
  const removeTag = (tag: string) => {   // removes a tag
    setTags(tags.filter((t) => t !== tag));
  };

  useEffect(() => {   // checks auth
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Please login first")
          router.replace("/login");
        } else {
          setLoading(false);
          reset(); // reset form
        }
      } catch {
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router, reset]);

  const propertyType = watch("propertyType");   // wathces property type for conditional bhk

  const onSubmit = async (data: FormData) => {   // get current user
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const transformedData = {
        ...data,
        tags,
      };

      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transformedData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Error creating lead");
      }

      toast.success("Lead created successfully!");
      router.push("/buyers");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <HashLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-xs">
        <h1 className="text-3xl font-extrabold mb-8 border-b pb-3 text-blue-400">
          Create New Lead
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Name */}
          <div className="grid gap-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="grid gap-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* City */}
          <div className="grid gap-1">
            <Label>City</Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Mohali">Mohali</SelectItem>
                    <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                    <SelectItem value="Panchkula">Panchkula</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Property Type */}
          <div className="grid gap-1">
            <Label>Property Type</Label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Plot">Plot</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.propertyType && (
              <p className="text-sm text-red-600">
                {errors.propertyType.message}
              </p>
            )}
          </div>

          {/* BHK- Conditional */}
          {["Apartment", "Villa"].includes(propertyType ?? "") && (
            <div className="grid gap-1">
              <Label>BHK</Label>
              <Controller
                name="bhk"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bhk && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bhk.message}
                </p>
              )}
            </div>
          )}

          {/* Purpose */}
          <div className="grid gap-1">
            <Label>Purpose</Label>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">
                {errors.purpose.message}
              </p>
            )}
          </div>

          {/* Min Budget */}
          <div className="grid gap-1">
            <Label htmlFor="budgetMin">Minimum Budget (INR)</Label>
            <Input
              id="budgetMin"
              type="number"
              {...register("budgetMin", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />
            {errors.budgetMin && (
              <p className="mt-1 text-sm text-red-600">
                {errors.budgetMin.message}
              </p>
            )}
          </div>

          {/* Max Budget */}
          <div className="grid gap-1">
            <Label htmlFor="budgetMax">Maximum Budget (INR)</Label>
            <Input
              id="budgetMax"
              type="number"
              {...register("budgetMax", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />
            {errors.budgetMax && (
              <p className="mt-1 text-sm text-red-600">
                {errors.budgetMax.message}
              </p>
            )}
          </div>
          
          {/* Timeline */}
          <div className="grid gap-1">
            <Label>Timeline</Label>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZeroToThreeMonths">
                      0-3 months
                    </SelectItem>
                    <SelectItem value="ThreeToSixMonths">3-6 months</SelectItem>
                    <SelectItem value="MoreThanSixMonths">
                      &gt; 6 months
                    </SelectItem>
                    <SelectItem value="Exploring">Exploring</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.timeline && (
              <p className="mt-1 text-sm text-red-600">
                {errors.timeline.message}
              </p>
            )}
          </div>

          {/* Source */}
          <div className="grid gap-1">
            <Label>Source</Label>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="WalkIn">Walk-in</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">
                {errors.source.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-1">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              defaultValue="New"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Visited">Visited</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="grid gap-1">
            <Label htmlFor="tags">Tags</Label>

            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Input to add tags */}
            <Input
              ref={tagInputRef}
              id="tags"
              placeholder="Type and press enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const inputValue = e.currentTarget.value;
                  addTag(inputValue);
                  e.currentTarget.value = "";
                }
              }}
            />

            {/* Predefined tags */}
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {predefinedTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                  className="hover:bg-blue-50"
                >
                  {tag}
                </Button>
              ))}
            </div>

            {errors.tags && (
              <p
                className="text-sm text-red-600"
                role="status"
                aria-live="polite"
              >
                {errors.tags.message}
              </p>
            )}
          </div>

          {/* Submit Form */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="hover:bg-transparent border-2 font-semi  bold cursor-pointer hover:text-blue-500 border-blue-500 bg-blue-400 text-white"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <BadgePlus size={18} /> Create Lead
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
