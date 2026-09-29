"use client";

import { useState } from "react";
import { DesiredRole } from "@/lib/api";
import {
  JOB_TAXONOMY,
  JobCategoryKey,
  JOB_CATEGORY_KEYS,
  subcategoryKeysFor,
  jobCategoryLabel,
  jobSubcategoryLabel,
} from "@/lib/job-taxonomy";

const MAX_ROLES = 3;

export function DesiredRolePicker({
  value,
  onChange,
}: {
  value: DesiredRole[];
  onChange: (value: DesiredRole[]) => void;
}) {
  const [pendingCategory, setPendingCategory] = useState<JobCategoryKey | "">("");
  const [pendingSubcategory, setPendingSubcategory] = useState("");

  const sorted = value.slice().sort((a, b) => a.priority - b.priority);
  const isSelected = (category: string, subcategory: string) =>
    sorted.some((r) => r.job_category === category && r.job_subcategory === subcategory);

  const addRole = () => {
    if (!pendingCategory || !pendingSubcategory) return;
    if (sorted.length >= MAX_ROLES) return;
    if (isSelected(pendingCategory, pendingSubcategory)) return;

    onChange([...sorted, { job_category: pendingCategory, job_subcategory: pendingSubcategory, priority: sorted.length + 1 }]);
    setPendingCategory("");
    setPendingSubcategory("");
  };

  const removeRole = (subcategory: string) => {
    const next = sorted
      .filter((r) => r.job_subcategory !== subcategory)
      .map((r, i) => ({ ...r, priority: i + 1 }));
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = sorted.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((r, i) => ({ ...r, priority: i + 1 })));
  };

  const subcategoryOptions = subcategoryKeysFor(pendingCategory);

  return (
    <div>
      <div className="desired-role-add-row">
        <select
          value={pendingCategory}
          onChange={(e) => {
            setPendingCategory(e.target.value as JobCategoryKey | "");
            setPendingSubcategory("");
          }}
        >
          <option value="">大分類を選択</option>
          {JOB_CATEGORY_KEYS.map((category) => (
            <option key={category} value={category}>
              {JOB_TAXONOMY[category].label}
            </option>
          ))}
        </select>
        <select
          value={pendingSubcategory}
          onChange={(e) => setPendingSubcategory(e.target.value)}
          disabled={!pendingCategory}
        >
          <option value="">小分類を選択</option>
          {subcategoryOptions.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {jobSubcategoryLabel(pendingCategory, subcategory)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary"
          onClick={addRole}
          disabled={!pendingCategory || !pendingSubcategory || sorted.length >= MAX_ROLES}
        >
          追加
        </button>
      </div>

      {sorted.length > 0 && (
        <ol className="desired-role-order-list">
          {sorted.map((r, index) => (
            <li key={r.job_subcategory}>
              <span className="tag">{index + 1}位</span> {jobCategoryLabel(r.job_category) ?? r.job_category}
              ／{jobSubcategoryLabel(r.job_category, r.job_subcategory)}
              <span className="desired-role-order-controls">
                <button
                  type="button"
                  aria-label="上に移動"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="下に移動"
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1}
                >
                  ↓
                </button>
                <button type="button" aria-label="削除" onClick={() => removeRole(r.job_subcategory)}>
                  ×
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>
        最大{MAX_ROLES}つまで選択できます（{sorted.length}/{MAX_ROLES}）
      </p>
    </div>
  );
}
