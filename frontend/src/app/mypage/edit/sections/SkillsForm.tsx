"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateSkills, ApiError, Intern, StudentSkillInput } from "@/lib/api";
import { SkillEditor } from "@/components/SkillEditor";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";

function skillsKey(skills: StudentSkillInput[]): string {
  return JSON.stringify(
    skills
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => `${s.name}:${s.category}:${s.level}`)
  );
}

export function SkillsForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const initialSkills = intern.skills.map((s) => ({ name: s.name, category: s.category, level: s.level }));
  const [skills, setSkills] = useState<StudentSkillInput[]>(initialSkills);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isDirty = skillsKey(skills) !== skillsKey(initialSkills);
  const { confirmDiscard } = useUnsavedChangesGuard(isDirty);

  const handleCancel = () => {
    if (!confirmDiscard()) return;
    router.push("/mypage");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      const updated = await updateSkills(token, intern.id, skills);
      updateAccount(updated, token);
      router.push("/mypage");
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["更新に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-wide">
      <SkillEditor value={skills} onChange={setSkills} />
      {errors.length > 0 && (
        <div className="error-text">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={submitting}>
          保存する
        </button>
        <button type="button" className="btn-secondary" onClick={handleCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
