"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Intern, Company } from "@/lib/api";
import { StudentHome } from "./StudentHome";
import { CompanyHome } from "./CompanyHome";

export default function HomePage() {
  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token || !account) {
      router.push("/login");
    }
  }, [loading, token, account, router]);

  if (loading || !token || !account) return null;

  if (accountType === "company") {
    return <CompanyHome company={account as Company} token={token} />;
  }

  return <StudentHome intern={account as Intern} token={token} />;
}
