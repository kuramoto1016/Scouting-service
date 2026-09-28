"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  Intern,
  PortfolioItem,
  PortfolioItemInput,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/lib/api";
import { PortfolioItemForm } from "@/components/PortfolioItemForm";
import { PORTFOLIO_CONTEXT_LABELS } from "@/lib/profile-labels";

const MAX_ITEMS = 10;

export function PortfolioItemsForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<PortfolioItem[]>(intern.portfolio_items);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const applyUpdate = (updated: Intern) => {
    setItems(updated.portfolio_items);
    if (token) updateAccount(updated, token);
  };

  const handleCreate = async (input: PortfolioItemInput) => {
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      const updated = await createPortfolioItem(token, intern.id, input);
      applyUpdate(updated);
      setEditingId(null);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["追加に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (itemId: number, input: PortfolioItemInput) => {
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      const updated = await updatePortfolioItem(token, intern.id, itemId, input);
      applyUpdate(updated);
      setEditingId(null);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["更新に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const updated = await deletePortfolioItem(token, intern.id, itemId);
      applyUpdate(updated);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["削除に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length || !token) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      const updated = await reorderPortfolioItems(
        token,
        intern.id,
        next.map((i) => i.id)
      );
      applyUpdate(updated);
    } catch {
      setItems(items);
    }
  };

  if (editingId === "new") {
    return (
      <PortfolioItemForm
        onSubmit={handleCreate}
        onCancel={() => setEditingId(null)}
        submitting={submitting}
        errors={errors}
      />
    );
  }

  const editingItem = items.find((i) => i.id === editingId);
  if (editingItem) {
    return (
      <PortfolioItemForm
        initial={editingItem}
        onSubmit={(input) => handleUpdate(editingItem.id, input)}
        onCancel={() => setEditingId(null)}
        submitting={submitting}
        errors={errors}
      />
    );
  }

  return (
    <div>
      {errors.length > 0 && (
        <div className="error-text" style={{ marginBottom: "0.75rem" }}>
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
      <div className="portfolio-item-list">
        {items.map((item, index) => (
          <div key={item.id} className="card portfolio-item-card">
            <div className="card-title">{item.title}</div>
            {item.context && <div className="card-meta">{PORTFOLIO_CONTEXT_LABELS[item.context]}</div>}
            {item.summary && <p style={{ marginBottom: "0.5rem" }}>{item.summary}</p>}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" className="btn-secondary" onClick={() => setEditingId(item.id)}>
                編集
              </button>
              <button type="button" className="btn-secondary" onClick={() => handleDelete(item.id)}>
                削除
              </button>
              <button type="button" className="btn-secondary" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length < MAX_ITEMS && (
        <button type="button" className="btn-primary" onClick={() => setEditingId("new")}>
          制作物を追加する
        </button>
      )}
      <div style={{ marginTop: "1rem" }}>
        <button type="button" className="btn-secondary" onClick={() => router.push("/mypage")}>
          プロフィールに戻る
        </button>
      </div>
    </div>
  );
}
