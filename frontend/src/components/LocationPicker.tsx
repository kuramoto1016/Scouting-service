"use client";

import { forwardRef } from "react";
import { TagPicker, TagPickerHandle } from "./TagPicker";

export const SUGGESTED_LOCATIONS = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州",
  "沖縄",
  "リモート希望",
  "海外勤務希望",
];

export const LocationPicker = forwardRef<TagPickerHandle, { value: string; onChange: (value: string) => void }>(
  function LocationPicker({ value, onChange }, ref) {
    return (
      <TagPicker ref={ref} value={value} onChange={onChange} suggestions={SUGGESTED_LOCATIONS} allowCustom={false} />
    );
  }
);
