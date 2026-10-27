import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STR, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

// Homepage search — plain GET form to the real /search page.
// Magnifier icon only on the submit button, never the word "search".
export default function HomeSearch({ locale, plat }: { locale: Locale; plat: Platform }) {
  const d = STR[locale];
  return (
    <form action="/search" method="get" role="search" className="mb-4 flex gap-2">
      {plat !== "android" && <input type="hidden" name="platform" value={plat} />}
      <Input
        name="q"
        type="search"
        placeholder={d.searchPh}
        aria-label={d.searchPh}
        className="h-11 flex-1 rounded-xl bg-card text-[15px]"
      />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        aria-label={d.searchPh}
        className="motion-press size-11 shrink-0 rounded-xl bg-card"
      >
        <Search className="size-5" aria-hidden="true" />
      </Button>
    </form>
  );
}
