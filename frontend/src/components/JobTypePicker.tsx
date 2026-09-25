"use client";

import { TagPicker } from "./TagPicker";

const SUGGESTED_JOB_TYPES = [
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

export function JobTypePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TagPicker
      value={value}
      onChange={onChange}
      suggestions={SUGGESTED_JOB_TYPES}
      customPlaceholder="その他の希望職種を入力してEnter"
    />
  );
}
