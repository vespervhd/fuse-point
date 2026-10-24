"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <Button variant="ghost" onClick={logout}
      className="justify-start w-full text-destructive">
      🚪 خروج
    </Button>
  );
}
