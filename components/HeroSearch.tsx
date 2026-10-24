import SearchBox from "./SearchBox";

// جست‌وجوی اصلی صفحه‌ی خانه — وسط صفحه
export default function HeroSearch() {
  return (
    <section aria-label="جست‌وجوی سریع" className="mb-10">
      <div className="fx-current bg-card border border-border rounded-3xl p-5 sm:p-6 max-w-2xl mx-auto">
        <SearchBox compact large />
      </div>
    </section>
  );
}
