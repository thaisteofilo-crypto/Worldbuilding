"use client"
import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {
  return <div className="max-w-prose mx-auto px-4 py-8 flex flex-col gap-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/5" />
  </div>
}
