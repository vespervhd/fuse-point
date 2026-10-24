import Link from "next/link";
import CurrentDivider from "@/components/fx/CurrentDivider";
import Reveal from "@/components/fx/Reveal";

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
    <Reveal>
      <section className="mb-10" aria-label={title}>
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="font-head text-2xl leading-8 whitespace-nowrap">{title}</h2>
          <CurrentDivider />
          {href && (
            <Link href={href} className="text-sm text-primary hover:underline font-medium whitespace-nowrap">
              مشاهده همه
            </Link>
          )}
        </div>
        {children || (empty && <p className="text-muted-foreground text-sm bg-card border border-border rounded-xl p-6 text-center">{empty}</p>)}
      </section>
    </Reveal>
  );
}
