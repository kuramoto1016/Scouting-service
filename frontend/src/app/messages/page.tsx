"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchConversations, Conversation } from "@/lib/api";

export default function MessagesIndexPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    fetchConversations(token)
      .then((data) => {
        setConversations(data);
        if (data[0]) router.replace(`/messages/${data[0].id}`);
      })
      .catch(() => setError("会話一覧の取得に失敗しました"))
      .finally(() => setLoaded(true));
  }, [loading, router, token]);

  if (loading || !token || !loaded || conversations[0]) return null;

  return (
    <div className="teams-empty-state">
      <h1 className="page-title">チャット</h1>
      {error && <p className="error-text">{error}</p>}
      <p className="muted">まだ会話がありません。</p>
      <Link href={accountType === "company" ? "/interns" : "/jobs"} className="btn-primary">
        {accountType === "company" ? "インターン生を探す" : "募集を探す"}
      </Link>
    </div>
  );
}
