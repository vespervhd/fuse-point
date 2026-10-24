import SearchBox from "./SearchBox";
import Corona from "./Corona";
import { getLocale } from "@/lib/i18n-server";

// هیرو — کرونای چرخان بزرگ بدون هیچ تیتر/متنی (عین نمونه‌ی تأییدشده) + کارت جستجو با پالس جریان
export default async function HeroSearch() {
  const locale = await getLocale();
  return (
    <section aria-label="Fuse Point" className="pt-2 pb-1.5 text-center">
      <Corona />
      <div className="fx-current bg-card border border-border rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] max-w-[580px] mx-auto mt-2.5 p-[7px]">
        <SearchBox compact large locale={locale} />
      </div>
    </section>
  );
}
