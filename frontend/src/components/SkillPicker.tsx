"use client";

import { forwardRef } from "react";
import { TagPicker, TagPickerHandle } from "./TagPicker";

const SUGGESTED_SKILLS = [
  "Ruby",
  "Ruby on Rails",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Java",
  "Go",
  "PHP",
  "C++",
  "C#",
  "Swift",
  "Kotlin",
  "SQL",
];

export const SkillPicker = forwardRef<TagPickerHandle, { value: string; onChange: (value: string) => void }>(
  function SkillPicker({ value, onChange }, ref) {
    return (
      <TagPicker
        ref={ref}
        value={value}
        onChange={onChange}
        suggestions={SUGGESTED_SKILLS}
        customPlaceholder="その他のスキルを入力してEnter"
      />
    );
  }
);
