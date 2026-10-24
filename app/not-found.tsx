import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <FileQuestion className="w-16 h-16 mb-4 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-extrabold mb-2">صفحه‌ای پیدا نشد</h1>
      <p className="text-muted-foreground text-sm mb-6">نشانی واردشده اشتباه است یا این صفحه حذف شده.</p>
      <Link href="/" className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:opacity-90">
        بازگشت به خانه
      </Link>
    </div>
  );
}
