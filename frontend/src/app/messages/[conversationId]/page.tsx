"use client";

import { useEffect, useState, FormEvent, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchConversation, fetchMessages, sendMessage, Conversation, Message, ApiError } from "@/lib/api";

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params.conversationId);

  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
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

  const loadConversation = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchConversation(token, conversationId);
      setConversation(data);
    } catch {
      setError("会話情報の取得に失敗しました");
    }
  }, [token, conversationId]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMessages(token, conversationId);
      setMessages(data);
    } catch {
      setError("メッセージの取得に失敗しました");
    } finally {
      setLoadingMessages(false);
    }
  }, [token, conversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch resolves after the effect body returns
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(token, conversationId, body.trim());
      setMessages((prev) => [...prev, msg]);
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  if (loading || !token) return null;

  const headerTitle = conversation
    ? accountType === "company"
      ? conversation.title
      : (conversation.company?.name ?? "メッセージ")
    : "メッセージ";

  return (
    <div>
      <h1 className="page-title">{headerTitle}</h1>
      {accountType === "company" && conversation && conversation.interns.length > 1 && (
        <p className="muted message-participants">
          参加者: {conversation.interns.map((i) => i.name).join("、")}
        </p>
      )}
      {loadingMessages && <p className="muted">読み込み中...</p>}
      <div className="message-list">
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.sender_type === accountType ? "mine" : ""}`}>
            {m.sender_type === "intern" && conversation && conversation.interns.length > 1 && (
              <div className="message-sender">{m.sender_intern?.name ?? "不明なユーザー"}</div>
            )}
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
