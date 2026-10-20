import SearchBox from "./SearchBox";

// جست‌وجوی اصلی صفحه‌ی خانه — نوار فرمان جهت «ج» (پرامپت ‎>‎ و راهنمای Ctrl K)
export default function HeroSearch() {
  return (
    <section aria-label="جست‌وجوی سریع" className="max-w-2xl mx-auto">
      <SearchBox compact cmdk />
    </section>
  );
}
