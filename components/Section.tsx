import Link from "next/link";

export default function Section({
  title,
  href,
  children,
  empty,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
  empty?: string;
}) {
  return (
    <section className="mb-10" aria-label={title}>
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="font-head text-2xl leading-8">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-primary hover:underline font-medium">
            مشاهده همه
          </Link>
        )}
      </div>
      {children || (empty && <p className="text-muted-foreground text-sm bg-card border border-border rounded-xl p-6 text-center">{empty}</p>)}
    </section>
  );
}
