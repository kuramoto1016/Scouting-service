"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchConversations, Intern, Company } from "@/lib/api";
import { InternProfileDetails } from "@/components/InternProfileDetails";

export default function MyPage() {
  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<(Intern | Company)[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    fetchConversations(token)
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false));
  }, [token]);

  if (loading || !token) return null;

  const partnerType = accountType === "company" ? "intern" : "company";

  return (
    <div>
      <h1 className="page-title">マイページ</h1>
      <div className="card">
        <div className="card-title">{account?.name}</div>
        <div className="card-meta">{account?.email}</div>
        {accountType === "company" && (account as Company).description && (
          <p>{(account as Company).description}</p>
        )}
        {accountType === "intern" && (
          <InternProfileDetails intern={account as Intern} />
        )}
      </div>

      {accountType === "intern" && (
        <div style={{ margin: "1rem 0" }}>
          <Link href="/mypage/edit" className="btn-primary">
            プロフィールを編集する
          </Link>
        </div>
      )}

      {accountType === "company" && (
        <div style={{ margin: "1rem 0" }}>
          <Link href="/interns" className="btn-primary">
            インターン生一覧を見る
          </Link>
        </div>
      )}

      {accountType === "company" && (
        <div style={{ margin: "1rem 0" }}>
          <Link href="/jobs/new">募集を掲載する</Link>
        </div>
      )}

      <h2 style={{ marginTop: "2rem", marginBottom: "0.75rem" }}>メッセージのやり取り</h2>
      {loadingConversations && <p className="muted">読み込み中...</p>}
      {!loadingConversations && conversations.length === 0 && (
        <p className="muted">まだメッセージのやり取りがありません。</p>
      )}
      {conversations.map((c) => (
        <Link key={c.id} href={`/messages/${partnerType}/${c.id}`} className="card" style={{ display: "block" }}>
          <div className="card-title">{c.name}</div>
          <div className="card-meta">{c.email}</div>
        </Link>
      ))}
    </div>
  );
}
