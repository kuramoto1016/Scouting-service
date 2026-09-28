"use client";

import { DesiredRole } from "@/lib/api";

const SUGGESTED_ROLES = [
  "バックエンドエンジニア",
  "フロントエンドエンジニア",
  "フルスタックエンジニア",
  "モバイルアプリエンジニア",
  "インフラ・SREエンジニア",
  "データサイエンティスト",
  "機械学習エンジニア",
  "QA・テストエンジニア",
  "UI/UXデザイナー",
  "プロダクトマネージャー",
];

const MAX_ROLES = 3;

export function DesiredRolePicker({
  value,
  onChange,
}: {
  value: DesiredRole[];
  onChange: (value: DesiredRole[]) => void;
}) {
  const sorted = value.slice().sort((a, b) => a.priority - b.priority);
  const selectedRoles = new Set(sorted.map((r) => r.role));

  const toggleRole = (role: string) => {
    if (selectedRoles.has(role)) {
      const next = sorted.filter((r) => r.role !== role).map((r, i) => ({ role: r.role, priority: i + 1 }));
      onChange(next);
      return;
    }
    if (sorted.length >= MAX_ROLES) return;
    onChange([...sorted, { role, priority: sorted.length + 1 }]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = sorted.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((r, i) => ({ role: r.role, priority: i + 1 })));
  };

  return (
    <div>
      <div className="skill-picker-suggestions">
        {SUGGESTED_ROLES.map((role) => {
          const selected = selectedRoles.has(role);
          const disabled = !selected && sorted.length >= MAX_ROLES;
          return (
            <button
              key={role}
              type="button"
              className={`skill-chip ${selected ? "selected" : ""}`}
              onClick={() => toggleRole(role)}
              disabled={disabled}
              aria-pressed={selected}
            >
              {selected && "✓ "}
              {role}
            </button>
          );
        })}
      </div>

      {sorted.length > 0 && (
        <ol className="desired-role-order-list">
          {sorted.map((r, index) => (
            <li key={r.role}>
              <span className="tag">{index + 1}位</span> {r.role}
              <span className="desired-role-order-controls">
                <button
                  type="button"
                  aria-label={`${r.role}を上に移動`}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`${r.role}を下に移動`}
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1}
                >
                  ↓
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
