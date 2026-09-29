"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  Intern,
  StudentHighlight,
  StudentHighlightInput,
  createStudentHighlight,
  updateStudentHighlight,
  deleteStudentHighlight,
  reorderStudentHighlights,
} from "@/lib/api";
import { HighlightForm } from "@/components/HighlightForm";

const MAX_HIGHLIGHTS = 3;

export function HighlightsForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const [highlights, setHighlights] = useState<StudentHighlight[]>(intern.highlights);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const applyUpdate = (updated: Intern) => {
    setHighlights(updated.highlights);
    if (token) updateAccount(updated, token);
  };

  const handleCreate = async (input: StudentHighlightInput) => {
    if (!token) return;
    setErrors([]);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const updated = await createStudentHighlight(token, intern.id, input);
      applyUpdate(updated);
      setEditingId(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        setFieldErrors(err.fieldErrors);
      } else {
        setErrors(["追加に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (highlightId: number, input: StudentHighlightInput) => {
    if (!token) return;
    setErrors([]);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const updated = await updateStudentHighlight(token, intern.id, highlightId, input);
      applyUpdate(updated);
      setEditingId(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        setFieldErrors(err.fieldErrors);
      } else {
        setErrors(["更新に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (highlightId: number) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const updated = await deleteStudentHighlight(token, intern.id, highlightId);
      applyUpdate(updated);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["削除に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= highlights.length || !token) return;
    const next = highlights.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setHighlights(next);
    try {
      const updated = await reorderStudentHighlights(
        token,
        intern.id,
        next.map((h) => h.id)
      );
      applyUpdate(updated);
    } catch {
      setHighlights(highlights);
    }
  };

  if (editingId === "new") {
    return (
      <HighlightForm
        onSubmit={handleCreate}
        onCancel={() => setEditingId(null)}
        submitting={submitting}
        errors={errors}
        fieldErrors={fieldErrors}
      />
    );
  }

  const editingHighlight = highlights.find((h) => h.id === editingId);
  if (editingHighlight) {
    return (
      <HighlightForm
        initial={editingHighlight}
        onSubmit={(input) => handleUpdate(editingHighlight.id, input)}
        onCancel={() => setEditingId(null)}
        submitting={submitting}
        errors={errors}
        fieldErrors={fieldErrors}
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
        {highlights.map((highlight, index) => (
          <div key={highlight.id} className="card portfolio-item-card">
            <div className="card-title">{highlight.title}</div>
            <p style={{ marginBottom: "0.5rem", whiteSpace: "pre-wrap" }}>{highlight.body}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" className="btn-secondary" onClick={() => setEditingId(highlight.id)}>
                編集
              </button>
              <button type="button" className="btn-secondary" onClick={() => handleDelete(highlight.id)}>
                削除
              </button>
              <button type="button" className="btn-secondary" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => move(index, 1)}
                disabled={index === highlights.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      {highlights.length < MAX_HIGHLIGHTS && (
        <button type="button" className="btn-primary" onClick={() => setEditingId("new")}>
          学生時代に力を入れたことを追加する
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
