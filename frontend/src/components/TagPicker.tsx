"use client";

import { useState, useMemo, useImperativeHandle, forwardRef, KeyboardEvent } from "react";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface TagPickerHandle {
  /**
   * Commits any text left in the custom-input box into the selected tags
   * and returns the resulting comma-separated value. No-op when custom
   * input is disabled.
   */
  commitPendingInput: () => string;
}

export const TagPicker = forwardRef<
  TagPickerHandle,
  {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    /** Set to false to restrict selection to `suggestions` only. Defaults to true. */
    allowCustom?: boolean;
    customPlaceholder?: string;
  }
>(function TagPicker({ value, onChange, suggestions, allowCustom = true, customPlaceholder }, ref) {
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

  useImperativeHandle(ref, () => ({
    commitPendingInput: () => {
      if (!allowCustom) return value;
      const tag = customInput.trim();
      if (!tag || selected.includes(tag)) {
        setCustomInput("");
        return value;
      }
      const next = [...selected, tag].join(", ");
      onChange(next);
      setCustomInput("");
      return next;
    },
  }));

  const removeTag = (tag: string) => {
    onChange(selected.filter((s) => s !== tag).join(", "));
  };

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // IME変換確定のEnterでは追加しない（keyCode 229 は古いブラウザ向けの保険）
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
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

      {allowCustom && customTags.length > 0 && (
        <div className="skill-picker-suggestions" style={{ marginTop: "0.5rem" }}>
          {customTags.map((tag) => (
            <button key={tag} type="button" className="skill-chip selected" onClick={() => removeTag(tag)}>
              {tag} ×
            </button>
          ))}
        </div>
      )}

      {allowCustom && (
        <div className="skill-picker-custom">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder={customPlaceholder}
            aria-label={customPlaceholder}
          />
          <button type="button" onClick={addCustomTag}>
            追加
          </button>
        </div>
      )}
    </div>
  );
});
