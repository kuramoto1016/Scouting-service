"use client";

import { TagPicker } from "./TagPicker";

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

export function SkillPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TagPicker
      value={value}
      onChange={onChange}
      suggestions={SUGGESTED_SKILLS}
      customPlaceholder="その他のスキルを入力してEnter"
    />
  );
}
