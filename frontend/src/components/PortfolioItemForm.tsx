"use client";

import { useState, FormEvent } from "react";
import { PortfolioContext, PortfolioItemInput } from "@/lib/api";
import { PORTFOLIO_CONTEXT_LABELS } from "@/lib/profile-labels";

const CONTEXT_OPTIONS: PortfolioContext[] = ["class_project", "personal", "hackathon", "intern", "other"];

interface PortfolioItemFormInitial {
  title?: string | null;
  summary?: string | null;
  context?: PortfolioContext | null;
  tech_stack?: string[] | null;
  highlights?: string | null;
  github_url?: string | null;
  other_url?: string | null;
}

export function PortfolioItemForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errors,
}: {
  initial?: PortfolioItemFormInitial;
  onSubmit: (input: PortfolioItemInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errors: string[];
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [context, setContext] = useState<PortfolioContext>(initial?.context ?? "personal");
  const [techStackInput, setTechStackInput] = useState((initial?.tech_stack ?? []).join(", "));
  const [highlights, setHighlights] = useState(initial?.highlights ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? "");
  const [otherUrl, setOtherUrl] = useState(initial?.other_url ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      summary,
      context,
      tech_stack: techStackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      highlights,
      github_url: githubUrl,
      other_url: otherUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-wide">
      <label>
        タイトル
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
      </label>
      <label>
        取り組んだ場所
        <select value={context} onChange={(e) => setContext(e.target.value as PortfolioContext)}>
          {CONTEXT_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {PORTFOLIO_CONTEXT_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label>
        概要
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={1000} />
      </label>
      <label>
        技術スタック（カンマ区切り）
        <input
          value={techStackInput}
          onChange={(e) => setTechStackInput(e.target.value)}
          placeholder="例: Ruby, Rails, React"
        />
      </label>
      <label>
        工夫した点
        <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} maxLength={1000} />
      </label>
      <label>
        GitHubリンク
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/..."
        />
      </label>
      <label>
        その他のリンク
        <input
          type="url"
          value={otherUrl}
          onChange={(e) => setOtherUrl(e.target.value)}
          placeholder="https://..."
        />
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
