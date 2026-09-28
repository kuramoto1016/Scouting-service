"use client";

import { useState } from "react";
import { JobCategory, WorkStyle } from "@/lib/api";
import { WORK_STYLE_LABELS, JOB_CATEGORY_LABELS, WORK_STYLE_OPTIONS, JOB_CATEGORY_OPTIONS } from "@/lib/job-posting-labels";

export interface JobPostingFilterValues {
  graduationYear: string;
  workStyle: WorkStyle | "";
  jobCategory: JobCategory | "";
  location: string;
}

export function JobPostingFilters({
  values,
  graduationYearOptions,
  onChange,
  onReset,
}: {
  values: JobPostingFilterValues;
  graduationYearOptions: number[];
  onChange: (values: JobPostingFilterValues) => void;
  onReset: () => void;
}) {
  const [collapsed, setCollapsed] = useState(true);

  const update = (patch: Partial<JobPostingFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <aside className="job-filters">
      <button
        type="button"
        className="job-filters-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        絞り込み {collapsed ? "▼" : "▲"}
      </button>
      <div className={`job-filters-body ${collapsed ? "collapsed" : ""}`}>
        <label>
          対象卒業年度
          <select value={values.graduationYear} onChange={(e) => update({ graduationYear: e.target.value })}>
            <option value="">指定なし</option>
            {graduationYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}年卒
              </option>
            ))}
          </select>
        </label>
        <label>
          開催形式
          <select
            value={values.workStyle}
            onChange={(e) => update({ workStyle: e.target.value as WorkStyle | "" })}
          >
            <option value="">指定なし</option>
            {WORK_STYLE_OPTIONS.map((style) => (
              <option key={style} value={style}>
                {WORK_STYLE_LABELS[style]}
              </option>
            ))}
          </select>
        </label>
        <label>
          職種カテゴリ
          <select
            value={values.jobCategory}
            onChange={(e) => update({ jobCategory: e.target.value as JobCategory | "" })}
          >
            <option value="">指定なし</option>
            {JOB_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {JOB_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          勤務地
          <input
            value={values.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="例: 東京都"
          />
        </label>
        <button type="button" className="btn-secondary" onClick={onReset}>
          条件をリセット
        </button>
      </div>
    </aside>
  );
}
