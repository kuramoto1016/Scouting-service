"use client";

import { forwardRef } from "react";
import { TagPicker, TagPickerHandle } from "./TagPicker";

const SUGGESTED_AXES = [
  "成長環境",
  "裁量権の大きさ",
  "技術力を伸ばせる",
  "チームで働ける",
  "社会貢献性",
  "給与・待遇",
  "働き方の柔軟性（リモート・時短など）",
  "事業の将来性",
  "教育・メンター制度",
  "サービスの規模感",
];

export const JobHuntingAxisPicker = forwardRef<
  TagPickerHandle,
  { value: string; onChange: (value: string) => void }
>(function JobHuntingAxisPicker({ value, onChange }, ref) {
  return (
    <TagPicker ref={ref} value={value} onChange={onChange} suggestions={SUGGESTED_AXES} allowCustom={false} />
  );
});
