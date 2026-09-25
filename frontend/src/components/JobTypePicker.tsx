"use client";

import { forwardRef } from "react";
import { TagPicker, TagPickerHandle } from "./TagPicker";

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

export const JobTypePicker = forwardRef<TagPickerHandle, { value: string; onChange: (value: string) => void }>(
  function JobTypePicker({ value, onChange }, ref) {
    return (
      <TagPicker ref={ref} value={value} onChange={onChange} suggestions={SUGGESTED_JOB_TYPES} allowCustom={false} />
    );
  }
);
