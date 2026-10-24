import Link from "next/link";
import type { Metadata } from "next";
import { Inbox, LogIn } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import RequestForm from "@/components/RequestForm";
import { BackLink, ViewHead, SectionHead, EmptyState } from "@/components/Bits";
import { getLocale } from "@/lib/i18n-server";
import { STR, platName, dateL, type Locale } from "@/lib/i18n";
import type { Platform } from "@/lib/store";

export const metadata: Metadata = { title: "درخواست اپ" };

type Props = { searchParams: Promise<{ platform?: string }> };

const STATUS_KEY: Record<string, "reqStatus_pending" | "reqStatus_added" | "reqStatus_rejected"> = {
  pending: "reqStatus_pending",
  added: "reqStatus_added",
  rejected: "reqStatus_rejected",
};

// نمای «درخواست اپ» — فرم پشت ورود (حساب‌محور) + فهرست درخواست‌های خودم با وضعیت واقعی
export default async function RequestPage({ searchParams }: Props) {
  const { platform } = await searchParams;
  const plat: Platform = platform === "windows" || platform === "linux" ? platform : "android";
  const locale: Locale = await getLocale();
  const d = STR[locale];
  const qs = plat === "android" ? "" : `?platform=${plat}`;
  const user = await getSessionUser();

  const mine = user
    ? await db.select().from(s.appRequests)
        .where(eq(s.appRequests.userId, user.id))
        .orderBy(desc(s.appRequests.createdAt))
        .limit(50)
    : [];

  return (
    <div className="animate-fade-up">
      <BackLink href={`/${qs}`} label={d.backStore} />
      <ViewHead title={d.reqApp} sub={d.reqSub} />

      {user ? (
        <>
          <RequestForm locale={locale} initialPlatform={plat} />
          <section className="mt-10" aria-label={d.reqMine}>
            <SectionHead title={d.reqMine} locale={locale} />
            {mine.length ? (
              <div className="flex flex-col gap-2.5">
                {mine.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[14.5px] m-0 truncate" dir="auto">{r.appName}</p>
                      <p className="text-muted-foreground text-xs mt-1 m-0">
                        {platName(locale, r.platform)} · {dateL(r.createdAt, locale)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold rounded-full px-2.5 py-1 border ${
                        r.status === "added"
                          ? "text-success border-success/40 bg-success/10"
                          : r.status === "rejected"
                            ? "text-destructive border-destructive/40 bg-destructive/10"
                            : "text-muted-foreground border-border bg-muted/40"
                      }`}
                    >
                      {d[STATUS_KEY[r.status] ?? "reqStatus_pending"]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Inbox className="w-6 h-6" aria-hidden="true" />} text={d.reqNone} />
            )}
          </section>
        </>
      ) : (
        <div className="bg-card border border-border rounded-[18px] p-[22px] text-center">
          <LogIn className="w-8 h-8 mx-auto mb-3 text-primary" aria-hidden="true" />
          <p className="font-extrabold text-[16px] m-0 mb-1.5">{d.reqLoginTitle}</p>
          <p className="text-muted-foreground text-[13px] leading-[1.9] m-0 mb-5">{d.reqLoginSub}</p>
          <Link
            href="/login?next=/request"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-extrabold rounded-xl px-5 py-3 text-[14.5px]"
          >
            {locale === "fa" ? "ورود به حساب" : "Sign in"}
          </Link>
        </div>
      )}
    </div>
  );
}
