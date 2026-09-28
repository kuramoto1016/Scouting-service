"use client";

import { useState } from "react";
import { SkillCategory, SkillLevel, StudentSkillInput } from "@/lib/api";
import { SKILL_CATEGORY_LABELS, SKILL_LEVEL_LABELS } from "@/lib/profile-labels";

const SUGGESTED_SKILLS_BY_CATEGORY: Record<SkillCategory, string[]> = {
  language: ["Ruby", "Python", "JavaScript", "TypeScript", "Java", "Go", "PHP", "C++", "C#", "Swift", "Kotlin", "SQL"],
  framework: ["Ruby on Rails", "React", "Next.js", "Vue.js", "Django", "Flask", "Spring", "TensorFlow", "PyTorch"],
  tool: ["Figma", "Docker", "Git", "AWS", "GCP", "Terraform"],
};

const CATEGORIES: SkillCategory[] = ["language", "framework", "tool"];
const LEVELS: SkillLevel[] = ["class_experience", "personal", "team"];

export function SkillEditor({
  value,
  onChange,
}: {
  value: StudentSkillInput[];
  onChange: (value: StudentSkillInput[]) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("language");
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");

  const selectedNames = new Set(value.map((s) => s.name));

  const addSkill = (name: string, category: SkillCategory) => {
    if (selectedNames.has(name)) return;
    onChange([...value, { name, category, level: "personal" }]);
  };

  const removeSkill = (name: string) => {
    onChange(value.filter((s) => s.name !== name));
  };

  const setLevel = (name: string, level: SkillLevel) => {
    onChange(value.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const candidates = SUGGESTED_SKILLS_BY_CATEGORY[activeCategory].filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const addCustomSkill = () => {
    const name = customInput.trim();
    if (!name) return;
    addSkill(name, activeCategory);
    setCustomInput("");
  };

  return (
    <div>
      <div className="skill-category-tabs" role="tablist">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {SKILL_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="スキルを検索"
        style={{ marginBottom: "0.6rem" }}
      />

      <div className="skill-picker-suggestions">
        {candidates.map((name) => {
          const selected = selectedNames.has(name);
          return (
            <button
              key={name}
              type="button"
              className={`skill-chip ${selected ? "selected" : ""}`}
              onClick={() => (selected ? removeSkill(name) : addSkill(name, activeCategory))}
              aria-pressed={selected}
            >
              {selected && "✓ "}
              {name}
            </button>
          );
        })}
      </div>

      <div className="skill-picker-custom">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              addCustomSkill();
            }
          }}
          placeholder="その他のスキルを入力してEnter"
          aria-label="その他のスキルを入力してEnter"
        />
        <button type="button" onClick={addCustomSkill}>
          追加
        </button>
      </div>

      {value.length > 0 && (
        <div className="selected-skill-list">
          <p className="card-meta" style={{ marginTop: "0.75rem" }}>
            選択したスキルの習熟度
          </p>
          {value.map((skill) => (
            <div key={skill.name} className="selected-skill-row">
              <span className="tag">{skill.name}</span>
              <div className="skill-level-toggle">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={skill.level === level ? "active" : ""}
                    onClick={() => setLevel(skill.name, level)}
                    aria-pressed={skill.level === level}
                  >
                    {SKILL_LEVEL_LABELS[level]}
                  </button>
                ))}
              </div>
              <button type="button" className="btn-secondary" onClick={() => removeSkill(skill.name)}>
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
