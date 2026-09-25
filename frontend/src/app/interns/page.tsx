"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchInterns, Intern } from "@/lib/api";
import { InternProfileDetails } from "@/components/InternProfileDetails";

export default function InternsListPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (accountType !== "company") {
      router.push("/mypage");
    }
  }, [loading, token, accountType, router]);

  useEffect(() => {
    if (!token || accountType !== "company") return;
    fetchInterns(token)
      .then(setInterns)
      .catch(() => setInterns([]))
      .finally(() => setLoadingInterns(false));
  }, [token, accountType]);

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <h1 className="page-title">インターン生一覧</h1>
      {loadingInterns && <p className="muted">読み込み中...</p>}
      {!loadingInterns && interns.length === 0 && <p className="muted">登録されているインターン生がいません。</p>}
      {interns.map((intern) => (
        <div key={intern.id} className="card">
          <div className="card-title">{intern.name}</div>
          <div className="card-meta">{intern.email}</div>
          <InternProfileDetails intern={intern} />
          <Link href={`/messages/intern/${intern.id}`}>メッセージを送る</Link>
        </div>
      ))}
    </div>
  );
}
