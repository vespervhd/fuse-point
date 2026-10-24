"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { STR, type Locale } from "@/lib/i18n";

export default function LogoutButton({ locale }: { locale: Locale }) {
  const d = STR[locale];
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <Button variant="ghost" onClick={logout}
      className="justify-start w-full text-destructive">
      🚪 {d.logout}
    </Button>
  );
}
