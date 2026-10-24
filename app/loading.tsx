import { Skeleton } from "@/components/ui/skeleton";

// اسکلت بارگذاری صفحه اصلی — برای cold start سرور
export default function Loading() {
  return (
    <div>
      {/* بنر */}
      <Skeleton className="h-48 rounded-3xl mb-6" />
      {/* کارت‌های دسته */}
      <div className="flex gap-3 overflow-hidden mb-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="shrink-0 w-28 h-20 rounded-2xl" />
        ))}
      </div>
      {/* ردیف برنامه‌ها */}
      {[0, 1].map((s) => (
        <div key={s} className="mb-6">
          <Skeleton className="h-6 w-40 rounded-lg mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
