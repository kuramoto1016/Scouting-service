"use client";

import { useState, FormEvent } from "react";
import { StudentHighlight, StudentHighlightInput } from "@/lib/api";
import { FieldError } from "@/components/FieldError";

const TITLE_MAX_LENGTH = 100;
const BODY_MAX_LENGTH = 1000;

export function HighlightForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errors,
  fieldErrors,
}: {
  initial?: StudentHighlight;
  onSubmit: (input: StudentHighlightInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ title, body });
  };

  return (
    <form onSubmit={handleSubmit} className="form-wide">
      <label>
        見出し
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX_LENGTH} required />
        <FieldError messages={fieldErrors.title} />
      </label>
      <label>
        本文
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={BODY_MAX_LENGTH} required />
        <FieldError messages={fieldErrors.body} />
      </label>
      {errors.length > 0 && (
        <div className="error-text">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={submitting}>
          保存する
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
