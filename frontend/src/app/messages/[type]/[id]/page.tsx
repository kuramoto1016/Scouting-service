"use client";

import { useEffect, useState, FormEvent, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchMessages, sendMessage, Message, AccountType, ApiError } from "@/lib/api";

export default function MessagesPage() {
  const params = useParams<{ type: string; id: string }>();
  const partnerType = params.type as AccountType;
  const partnerId = Number(params.id);

  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMessages(token, partnerType, partnerId);
      setMessages(data);
    } catch {
      setError("メッセージの取得に失敗しました");
    } finally {
      setLoadingMessages(false);
    }
  }, [token, partnerType, partnerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(token, partnerType, partnerId, body.trim());
      setMessages((prev) => [...prev, msg]);
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  if (loading || !token) return null;

  return (
    <div>
      <h1 className="page-title">メッセージ</h1>
      {loadingMessages && <p className="muted">読み込み中...</p>}
      <div className="message-list">
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.sender_type === accountType ? "mine" : ""}`}>
            <div>{m.body}</div>
            <div className="message-meta">{new Date(m.created_at).toLocaleString("ja-JP")}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit} className="message-form">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="メッセージを入力"
          required
        />
        <button type="submit" disabled={sending}>
          送信
        </button>
      </form>
    </div>
  );
}
