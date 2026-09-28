"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateSelfPr, ApiError, Intern } from "@/lib/api";

export function SelfPrForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(intern.self_pr.bio ?? "");
  const [careerGoal, setCareerGoal] = useState(intern.self_pr.career_goal ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      const updated = await updateSelfPr(token, intern.id, { bio, career_goal: careerGoal });
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
      <label>
        自己紹介
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="どんなことに興味があるか、これまでの取り組みなどを書いてみましょう。"
        />
      </label>
      <label>
        将来のキャリア像・学びたいこと
        <textarea
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          placeholder="例: 将来はバックエンドエンジニアとしてサービス開発に携わりたい"
        />
      </label>
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
        <button type="button" className="btn-secondary" onClick={() => router.push("/mypage")}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
