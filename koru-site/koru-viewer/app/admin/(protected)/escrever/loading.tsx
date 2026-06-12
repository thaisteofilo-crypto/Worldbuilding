"use client"
import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() {
  return (
    <div className="flex gap-4 h-[calc(100vh-80px)]">
      <Skeleton className="w-[220px] rounded-xl" />
      <Skeleton className="flex-1 rounded-xl" />
      <Skeleton className="w-[260px] rounded-xl" />
    </div>
  )
}
