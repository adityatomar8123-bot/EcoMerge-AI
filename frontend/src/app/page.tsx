"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/dashboard/overview");
    }
  }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
      <div className="animate-pulse">Loading EcoMerge AI...</div>
    </div>
  );
}
