import Link from "next/link";

export default function Section({
  title,
  href,
  children,
  empty,
  code,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
  empty?: string;
  code?: string;
}) {
  return (
    <section className="mb-10" aria-label={title}>
      <div className="mb-3.5">
        {code && (
          <span className="block font-mono text-[10.5px] text-primary mb-0.5" dir="ltr" style={{ textAlign: "right" }}>
            {code}
          </span>
        )}
        <div className="flex items-baseline justify-between">
          <h2 className="font-head text-lg leading-8">{title}</h2>
          {href && (
            <Link href={href} className="text-sm text-primary hover:underline font-medium">
              مشاهده همه
            </Link>
          )}
        </div>
      </div>
      {children || (empty && <p className="text-muted text-sm bg-surface border border-border rounded-xl p-6 text-center">{empty}</p>)}
    </section>
  );
}
