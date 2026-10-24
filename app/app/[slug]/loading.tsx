import { Skeleton } from "@/components/ui/skeleton";

// اسکلت بارگذاری صفحه برنامه
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex gap-4 items-start mb-2">
        <Skeleton className="w-24 h-24 rounded-3xl shrink-0" />
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
  );
}
