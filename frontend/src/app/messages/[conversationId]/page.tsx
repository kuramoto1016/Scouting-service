"use client";

import { useEffect, useState, FormEvent, ChangeEvent, useRef, useCallback } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchConversation,
  fetchConversations,
  fetchAttachmentBlob,
  fetchMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  Conversation,
  Message,
  MessageAttachment,
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

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function isImageAttachment(contentType: string): boolean {
  return contentType.startsWith("image/");
}

// `message.sender_type === accountType` alone is not enough to identify "my"
// messages in a group conversation: it would also match every other intern
// participant's messages for an intern viewer. Company senders are unambiguous
// (a conversation has exactly one company), so only the intern case needs the
// extra sender_intern_id check.
function isMessageMine(message: Message, accountType: string | null, accountId: number | undefined): boolean {
  if (message.sender_type !== accountType) return false;
  if (accountType === "intern") return message.sender_intern?.id === accountId;
  return true;
}

const MAX_ATTACHMENTS = 5;
const MESSAGE_BODY_MAX_LENGTH = 3000;

function AuthenticatedAttachment({ attachment, token }: { attachment: MessageAttachment; token: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const imageLinkRef = useRef<HTMLAnchorElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isImage = isImageAttachment(attachment.content_type);

  useEffect(() => {
    if (!isImage) return;
    const element = imageLinkRef.current;
    if (!element) return;

    let disposed = false;
    let isIntersecting = false;
    let loading = false;

    const releaseObjectUrl = (updateState: boolean) => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (updateState) setObjectUrl(null);
    };

    const loadObjectUrl = () => {
      if (loading || objectUrlRef.current) return;
      loading = true;

      fetchAttachmentBlob(token, attachment.url)
        .then((blob) => {
          const nextObjectUrl = URL.createObjectURL(blob);
          if (disposed || !isIntersecting) {
            URL.revokeObjectURL(nextObjectUrl);
            return;
          }
          objectUrlRef.current = nextObjectUrl;
          setObjectUrl(nextObjectUrl);
        })
        .catch(() => {
          if (!disposed) setObjectUrl(null);
        })
        .finally(() => {
          loading = false;
        });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          loadObjectUrl();
        } else {
          releaseObjectUrl(true);
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(element);

    return () => {
      disposed = true;
      observer.disconnect();
      releaseObjectUrl(false);
    };
  }, [attachment.url, isImage, token]);

  const openAttachment = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (objectUrl) return;

    event.preventDefault();
    const attachmentWindow = isImage ? window.open("about:blank", "_blank") : null;
    if (attachmentWindow) attachmentWindow.opener = null;

    try {
      setAttachmentError(null);
      const blob = await fetchAttachmentBlob(token, attachment.url);
      const nextObjectUrl = URL.createObjectURL(blob);
      if (isImage && attachmentWindow) {
        attachmentWindow.location.href = nextObjectUrl;
      } else {
        const downloadLink = document.createElement("a");
        downloadLink.href = nextObjectUrl;
        downloadLink.download = attachment.filename;
        downloadLink.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(nextObjectUrl), 60_000);
    } catch {
      attachmentWindow?.close();
      setAttachmentError("添付ファイルを取得できませんでした。");
    }
  };

  if (isImage) {
    return (
      <span className="teams-attachment-item">
        <a
          ref={imageLinkRef}
          href={objectUrl ?? attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="teams-attachment-image-link"
          onClick={openAttachment}
        >
          {objectUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- authenticated user upload rendered from a blob URL
            <img src={objectUrl} alt={attachment.filename} className="teams-attachment-image" />
          )}
        </a>
        {attachmentError && (
          <span className="teams-attachment-error" role="alert">
            {attachmentError}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="teams-attachment-item">
      <a
        href={attachment.url}
        download={attachment.filename}
        className="teams-attachment-file"
        onClick={openAttachment}
      >
        <span className="material-symbols-outlined teams-attachment-icon">attach_file</span>
        <span className="teams-attachment-name">{attachment.filename}</span>
        <span className="teams-attachment-size">{formatByteSize(attachment.byte_size)}</span>
      </a>
      {attachmentError && (
        <span className="teams-attachment-error" role="alert">
          {attachmentError}
        </span>
      )}
    </span>
  );
}

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params.conversationId);

  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [conversationFilter, setConversationFilter] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [messageActionError, setMessageActionError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const submitMessage = async () => {
    if (sending || !token || body.length > MESSAGE_BODY_MAX_LENGTH || (!body.trim() && pendingFiles.length === 0)) return;
    const filesToSend = pendingFiles;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(token, conversationId, body.trim(), filesToSend);
      setMessages((prev) => [...prev, msg]);
      setBody("");
      setPendingFiles((prev) => prev.filter((file) => !filesToSend.includes(file)));
      loadConversations();
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;

    e.preventDefault();
    void submitMessage();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    setError(null);
    setPendingFiles((prev) => {
      const next = [...prev, ...selected].slice(0, MAX_ATTACHMENTS);
      return next;
    });
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditing = (message: Message) => {
    setMessageActionError(null);
    setEditingMessageId(message.id);
    setEditingBody(message.body);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingBody("");
  };

  const submitEdit = async (messageId: number) => {
    if (!token || !editingBody.trim()) return;
    setMessageActionError(null);
    try {
      const updated = await updateMessage(token, conversationId, messageId, editingBody.trim());
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      cancelEditing();
      loadConversations();
    } catch (err) {
      setMessageActionError(err instanceof ApiError ? err.errors.join(", ") : "編集に失敗しました");
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!token) return;
    if (!window.confirm("このメッセージを削除しますか？")) return;

    setMessageActionError(null);
    try {
      const updated = await deleteMessage(token, conversationId, messageId);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      loadConversations();
    } catch (err) {
      setMessageActionError(err instanceof ApiError ? err.errors.join(", ") : "削除に失敗しました");
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
                    ? `${item.latest_message.sender_name ?? "企業"}: ${
                        item.latest_message.deleted ? "（このメッセージは削除されました）" : item.latest_message.body
                      }`
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
          {messageActionError && <p className="error-text">{messageActionError}</p>}
          {messages.map((m) => {
            const mine = isMessageMine(m, accountType, account?.id);
            const isEditing = editingMessageId === m.id;

            return (
              <article key={m.id} className={`teams-post ${mine ? "mine" : ""}`}>
                <div className="teams-post-avatar">
                  {initials(m.sender_type === "company" ? conversation?.company?.name ?? "企業" : m.sender_intern?.name ?? "学生")}
                </div>
                <div className="teams-post-body">
                  <div className="teams-post-meta">
                    <span>{m.sender_type === "company" ? conversation?.company?.name ?? "企業" : m.sender_intern?.name ?? "不明なユーザー"}</span>
                    <time>{new Date(m.created_at).toLocaleString("ja-JP")}</time>
                    {m.edited && !m.deleted && <span className="teams-post-edited">（編集済み）</span>}
                  </div>

                  {m.deleted ? (
                    <p className="muted teams-post-deleted">このメッセージは削除されました</p>
                  ) : isEditing ? (
                    <div className="teams-post-edit-form">
                      <textarea
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        maxLength={MESSAGE_BODY_MAX_LENGTH}
                        autoFocus
                      />
                      <div className="teams-post-edit-actions">
                        <button type="button" onClick={() => submitEdit(m.id)} disabled={!editingBody.trim()}>
                          保存
                        </button>
                        <button type="button" className="btn-secondary" onClick={cancelEditing}>
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {m.body && <p>{m.body}</p>}
                      {m.attachments.length > 0 && (
                        <div className="teams-attachment-list">
                          {m.attachments.map((attachment) => (
                            <AuthenticatedAttachment key={attachment.id} attachment={attachment} token={token} />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {mine && !m.deleted && !isEditing && (
                    <div className="teams-post-actions">
                      <button type="button" className="link-button" onClick={() => startEditing(m)}>
                        編集
                      </button>
                      <button type="button" className="link-button" onClick={() => handleDelete(m.id)}>
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {!loadingMessages && messages.length === 0 && <p className="muted teams-empty">最初のメッセージを送信できます</p>}
          <div ref={bottomRef} />
        </section>

        {error && <p className="error-text teams-error">{error}</p>}
        {pendingFiles.length > 0 && (
          <div className="teams-pending-attachments">
            {pendingFiles.map((file, index) => (
              <span key={`${file.name}-${index}`} className="teams-pending-attachment">
                <span className="material-symbols-outlined teams-pending-attachment-icon" aria-hidden="true">
                  attach_file
                </span>
                {file.name}
                <button
                  type="button"
                  onClick={() => removePendingFile(index)}
                  aria-label={`${file.name} を削除`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="teams-composer">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            maxLength={MESSAGE_BODY_MAX_LENGTH}
            placeholder={`${headerTitle} にメッセージを送信`}
          />
          <div className="teams-composer-actions">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="teams-tool-button"
              title="添付"
              aria-label="添付"
              onClick={() => fileInputRef.current?.click()}
              disabled={pendingFiles.length >= MAX_ATTACHMENTS}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                attach_file
              </span>
            </button>
            <span className="teams-composer-count">
              {body.length} / {MESSAGE_BODY_MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={sending || body.length > MESSAGE_BODY_MAX_LENGTH || (!body.trim() && pendingFiles.length === 0)}
            >
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
