"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export default function SearchCategoryFilter({
  cats, current, base,
}: {
  cats: { slug: string; nameFa: string }[];
  current: string;
  base: string;
}) {
  const router = useRouter();
  return (
    <Select
      value={current === "" ? ALL : current}
      onValueChange={(v) => router.push(`${base}${v === ALL ? "" : `&cat=${v}`}`)}
    >
      <SelectTrigger size="sm" aria-label="فیلتر دسته‌بندی" className="max-w-44 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>همه‌ی دسته‌ها</SelectItem>
        {cats.map((c) => (
          <SelectItem key={c.slug} value={c.slug}>{c.nameFa}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
