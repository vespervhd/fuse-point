import { STR, bytesL, dateL, num, type Locale } from "@/lib/i18n";

type Version = {
  id: string;
  versionName: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string | null;
  fileSize: number | null;
  fileUrl?: string | null;
  changelog?: string | null;
};

const ChevronGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="dt-chevron">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HistoryGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 12a8.5 8.5 0 1 1 2.5 6.1M3.6 12H7m-3.4 0L5 8.8M12 7.8V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DownloadGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3.5v11m0 0 4.2-4.2M12 14.5l-4.2-4.2M4.5 16.5v3h15v-3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const stripMd = (s: string) =>
  s.replace(/\*\*|__|`/g, "").replace(/^#+\s*/gm, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();

// کشوی «نسخه‌های قبلی» — هم‌خانواده‌ی کشوی مشخصات؛ نسخه‌ی فعلی تکرار نمی‌شود
export default function VersionsDrawer({
  versions,
  locale = "fa",
  sourceLabel,
}: {
  versions: Version[];
  locale?: Locale;
  sourceLabel?: string | null;
}) {
  const d = STR[locale];
  const older = versions.slice(1);
  if (!older.length) return null;

  return (
    <details className="dt-details">
      <summary>
        <span className="dt-summary-icon" aria-hidden="true"><HistoryGlyph /></span>
        <span className="dt-summary-copy">
          <span className="dt-summary-title">{d.versions}</span>
          <span className="dt-summary-caption">{num(older.length, locale)} {d.versionsCap}</span>
        </span>
        <ChevronGlyph />
      </summary>
      <div className="dt-content">
        {sourceLabel && (
          <p className="ver-src">
            {d.verSource}:{" "}
            <span dir="auto"><bdi>{sourceLabel}</bdi></span>
          </p>
        )}
        <div>
          {older.map((v) => {
            const date = v.publishedAt || v.createdAt;
            const log = v.changelog ? stripMd(v.changelog) : "";
            return (
              <div key={v.id} className="ver-row">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="ver-name" dir="ltr">
                      {v.versionName ? (/^v/i.test(v.versionName) ? v.versionName : `v${v.versionName}`) : "—"}
                    </span>
                    {date && <span className="ver-date">{dateL(date, locale)}</span>}
                  </div>
                  <div className="ver-meta">
                    {v.fileSize ? `${d.fileSize}: ${bytesL(v.fileSize, locale)}` : ""}
                  </div>
                  {log && <p className="ver-log">{log.split("\n")[0]}</p>}
                </div>
                <a
                  className="ver-dl"
                  href={`/api/download/${v.id}`}
                  download
                  aria-label={`${d.download} ${v.versionName ?? ""}`}
                >
                  <DownloadGlyph />
                  {d.download}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
