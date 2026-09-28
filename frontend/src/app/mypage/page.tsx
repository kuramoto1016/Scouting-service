"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchConversations, Intern, Company, Conversation } from "@/lib/api";
import { StudentMyPage } from "./StudentMyPage";

export default function MyPage() {
  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

  if (loading || !token || !account) return null;

  if (accountType === "intern") {
    return (
      <div>
        <StudentMyPage intern={account as Intern} />
        <div id="conversations" style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>受信したスカウト</h2>
          {loadingConversations && <p className="muted">読み込み中...</p>}
          {!loadingConversations && conversations.length === 0 && (
            <p className="muted">まだメッセージのやり取りがありません。</p>
          )}
          {conversations.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="card" style={{ display: "block" }}>
              <div className="card-title">{c.company?.name}</div>
              {c.interns.length > 1 && (
                <div className="card-meta">参加者: {c.interns.map((i) => i.name).join("、")}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const company = account as Company;

  return (
    <div>
      <h1 className="page-title">マイページ</h1>
      <div className="card">
        <div className="card-title">{company.name}</div>
        <div className="card-meta">{company.email}</div>
        {company.description && <p>{company.description}</p>}
      </div>

      <div style={{ margin: "1rem 0" }}>
        <Link href="/interns" className="btn-primary">
          インターン生一覧を見る
        </Link>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <Link href="/jobs/new">募集を掲載する</Link>
      </div>

      <h2 style={{ marginTop: "2rem", marginBottom: "0.75rem" }}>メッセージのやり取り</h2>
      {loadingConversations && <p className="muted">読み込み中...</p>}
      {!loadingConversations && conversations.length === 0 && (
        <p className="muted">まだメッセージのやり取りがありません。</p>
      )}
      {conversations.map((c) => (
        <Link key={c.id} href={`/messages/${c.id}`} className="card" style={{ display: "block" }}>
          <div className="card-title">{c.title}</div>
        </Link>
      ))}
    </div>
  );
}
