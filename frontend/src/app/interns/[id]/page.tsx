"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchIntern, createConversation, Intern, ApiError } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";
import { ProfileSidebar } from "@/components/ProfileSidebar";

export default function InternDetailPage() {
  const params = useParams<{ id: string }>();
  const internId = Number(params.id);

  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [loadingIntern, setLoadingIntern] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingConversation, setStartingConversation] = useState(false);

  const handleStartConversation = async () => {
    if (!token) return;
    setStartingConversation(true);
    setError(null);
    try {
      const conversation = await createConversation(token, [internId]);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "会話の開始に失敗しました");
      setStartingConversation(false);
    }
  };

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

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded by `cancelled` below
    setLoadingIntern(true);
    fetchIntern(token, internId)
      .then((data) => {
        if (cancelled) return;
        setIntern(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.errors.join(", ") : "インターン情報の取得に失敗しました");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingIntern(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, accountType, internId]);

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <Link href="/interns" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← インターン生一覧に戻る
      </Link>
      {loadingIntern && <p className="muted">読み込み中...</p>}
      {error && <p className="error-text">{error}</p>}
      {intern && (
        <div className="profile-layout">
          <ProfileSidebar
            intern={intern}
            nav={
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={handleStartConversation}
                disabled={startingConversation}
              >
                メッセージを送る
              </button>
            }
          />
          <div className="profile-main">
            <ProfileView intern={intern} editable={false} />
          </div>
        </div>
      )}
    </div>
  );
}
