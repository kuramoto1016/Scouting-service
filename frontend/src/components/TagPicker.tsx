"use client";

import { useState, useMemo, KeyboardEvent } from "react";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TagPicker({
  value,
  onChange,
  suggestions,
  customPlaceholder,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  customPlaceholder: string;
}) {
  const selected = useMemo(() => parseTags(value), [value]);
  const [customInput, setCustomInput] = useState("");

  const toggleTag = (tag: string) => {
    const next = selected.includes(tag) ? selected.filter((s) => s !== tag) : [...selected, tag];
    onChange(next.join(", "));
  };

  const addCustomTag = () => {
    const tag = customInput.trim();
    if (!tag || selected.includes(tag)) {
      setCustomInput("");
      return;
    }
    onChange([...selected, tag].join(", "));
    setCustomInput("");
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((s) => s !== tag).join(", "));
  };

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  const customTags = selected.filter((s) => !suggestions.includes(s));

  return (
    <div>
      <div className="skill-picker-suggestions">
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`skill-chip ${selected.includes(tag) ? "selected" : ""}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {customTags.length > 0 && (
        <div className="skill-picker-suggestions" style={{ marginTop: "0.5rem" }}>
          {customTags.map((tag) => (
            <button key={tag} type="button" className="skill-chip selected" onClick={() => removeTag(tag)}>
              {tag} ×
            </button>
          ))}
        </div>
      )}

      <div className="skill-picker-custom">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder={customPlaceholder}
        />
        <button type="button" onClick={addCustomTag}>
          追加
        </button>
      </div>
    </div>
  );
}
