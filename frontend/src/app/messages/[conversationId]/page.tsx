"use client";

import { useEffect, useState, FormEvent, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
  Conversation,
  Message,
  ApiError,
} from "@/lib/api";

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params.conversationId);

  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [conversationFilter, setConversationFilter] = useState("");
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

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchConversations(token);
      setConversations(data);
    } catch {
      setError("会話一覧の取得に失敗しました");
    }
  }, [token]);

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
    setLoadingMessages(true);
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
    loadConversations();
    loadConversation();
    loadMessages();
  }, [loadConversation, loadConversations, loadMessages]);

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
      loadConversations();
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

  const visibleConversations = conversations.filter((item) => {
    const keyword = conversationFilter.trim().toLowerCase();
    if (!keyword) return true;
    return [item.title, item.company?.name, ...item.interns.map((intern) => intern.name), item.latest_message?.body]
      .filter(Boolean)
      .some((text) => text!.toLowerCase().includes(keyword));
  });

  return (
    <div className="teams-shell">
      <aside className="teams-rail" aria-label="メッセージナビゲーション">
        <div className="teams-rail-item active" title="チャット">
          💬
        </div>
        <Link href={accountType === "company" ? "/interns" : "/jobs"} className="teams-rail-item" title="探す">
          🔎
        </Link>
        <Link href="/mypage" className="teams-rail-item" title="マイページ">
          👤
        </Link>
      </aside>

      <aside className="teams-sidebar">
        <div className="teams-sidebar-header">
          <h1>チャット</h1>
          <span className="teams-count">{conversations.length}</span>
        </div>
        <input
          className="teams-search"
          value={conversationFilter}
          onChange={(event) => setConversationFilter(event.target.value)}
          placeholder="会話を検索"
          aria-label="会話を検索"
        />
        <div className="teams-chat-list">
          {visibleConversations.map((item) => (
            <Link
              key={item.id}
              href={`/messages/${item.id}`}
              className={`teams-chat-item ${item.id === conversationId ? "active" : ""}`}
            >
              <div className="teams-avatar">{initials(accountType === "company" ? item.title : item.company?.name ?? item.title)}</div>
              <div className="teams-chat-summary">
                <div className="teams-chat-title-row">
                  <span className="teams-chat-title">{accountType === "company" ? item.title : item.company?.name ?? item.title}</span>
                  <span className="teams-chat-time">{formatActivityTime(item.last_activity_at)}</span>
                </div>
                <p className="teams-chat-preview">
                  {item.latest_message
                    ? `${item.latest_message.sender_name ?? "企業"}: ${item.latest_message.body}`
                    : `${item.participant_count}人の会話`}
                </p>
              </div>
            </Link>
          ))}
          {!visibleConversations.length && <p className="muted teams-empty">会話がありません</p>}
        </div>
      </aside>

      <main className="teams-main">
        <header className="teams-channel-header">
          <div>
            <p className="teams-kicker">{accountType === "company" ? "スカウト" : "企業チャット"}</p>
            <h2>{headerTitle}</h2>
          </div>
          <div className="teams-header-actions">
            <span>{conversation?.participant_count ?? 0}人</span>
            <button type="button" onClick={() => loadMessages()}>
              更新
            </button>
          </div>
        </header>

        <nav className="teams-tabs" aria-label="チャットタブ">
          <button type="button" className="active">
            投稿
          </button>
          <button type="button">ファイル</button>
          <button type="button">メモ</button>
        </nav>

        <section className="teams-thread" aria-label="メッセージ">
          {loadingMessages && <p className="muted">読み込み中...</p>}
          {messages.map((m) => (
            <article key={m.id} className={`teams-post ${m.sender_type === accountType ? "mine" : ""}`}>
              <div className="teams-post-avatar">
                {initials(m.sender_type === "company" ? conversation?.company?.name ?? "企業" : m.sender_intern?.name ?? "学生")}
              </div>
              <div className="teams-post-body">
                <div className="teams-post-meta">
                  <span>{m.sender_type === "company" ? conversation?.company?.name ?? "企業" : m.sender_intern?.name ?? "不明なユーザー"}</span>
                  <time>{new Date(m.created_at).toLocaleString("ja-JP")}</time>
                </div>
                <p>{m.body}</p>
              </div>
            </article>
          ))}
          {!loadingMessages && messages.length === 0 && <p className="muted teams-empty">最初のメッセージを送信できます</p>}
          <div ref={bottomRef} />
        </section>

        {error && <p className="error-text teams-error">{error}</p>}
        <form onSubmit={handleSubmit} className="teams-composer">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`${headerTitle} にメッセージを送信`}
            required
          />
          <div className="teams-composer-actions">
            <button type="button" className="teams-tool-button" title="添付" aria-label="添付">
              ＋
            </button>
            <button type="button" className="teams-tool-button" title="書式" aria-label="書式">
              A
            </button>
            <button type="submit" disabled={sending}>
              送信
            </button>
          </div>
        </form>
      </main>

      <aside className="teams-details">
        <section>
          <h3>参加者</h3>
          <div className="teams-member-list">
            {conversation?.company && (
              <div className="teams-member">
                <span className="teams-member-avatar">{initials(conversation.company.name)}</span>
                <div>
                  <strong>{conversation.company.name}</strong>
                  <p>企業</p>
                </div>
              </div>
            )}
            {conversation?.interns.map((intern) => (
              <div className="teams-member" key={intern.id}>
                <span className="teams-member-avatar">{initials(intern.name)}</span>
                <div>
                  <strong>{intern.name}</strong>
                  <p>インターン生</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {accountType === "company" && conversation && (
          <section>
            <h3>候補者</h3>
            <div className="teams-link-list">
              {conversation.interns.map((intern) => (
                <Link href={`/interns/${intern.id}`} key={intern.id}>
                  {intern.name} のプロフィール
                </Link>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
