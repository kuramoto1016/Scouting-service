"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createJobPosting, ApiError, WorkStyle, JobCategory } from "@/lib/api";
import { WORK_STYLE_LABELS, JOB_CATEGORY_LABELS, WORK_STYLE_OPTIONS, JOB_CATEGORY_OPTIONS } from "@/lib/job-posting-labels";

export default function NewJobPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [workStyle, setWorkStyle] = useState<WorkStyle | "">("");
  const [location, setLocation] = useState("");
  const [jobCategory, setJobCategory] = useState<JobCategory | "">("");
  const [skillsInput, setSkillsInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (accountType !== "company") {
      router.push("/mypage");
    }
  }, [loading, token, accountType, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    try {
      await createJobPosting(token, {
        title,
        description,
        graduation_year: graduationYear ? Number(graduationYear) : null,
        starts_on: startsOn || null,
        ends_on: endsOn || null,
        work_style: workStyle || null,
        location: location || null,
        job_category: jobCategory || null,
        skills: skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      router.push("/jobs");
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["掲載に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <h1 className="page-title">募集を掲載する</h1>
      <form onSubmit={handleSubmit} className="form-wide">
        <label>
          タイトル
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          詳細
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          対象卒業年度
          <input
            type="number"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder="例: 2028"
          />
        </label>
        <label>
          募集開始日
          <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
        </label>
        <label>
          締切日
          <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
        </label>
        <label>
          開催形式
          <select value={workStyle} onChange={(e) => setWorkStyle(e.target.value as WorkStyle | "")}>
            <option value="">指定なし</option>
            {WORK_STYLE_OPTIONS.map((style) => (
              <option key={style} value={style}>
                {WORK_STYLE_LABELS[style]}
              </option>
            ))}
          </select>
        </label>
        <label>
          勤務地
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例: 東京都渋谷区（オンラインなら空欄可）"
          />
        </label>
        <label>
          職種カテゴリ
          <select value={jobCategory} onChange={(e) => setJobCategory(e.target.value as JobCategory | "")}>
            <option value="">指定なし</option>
            {JOB_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {JOB_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          スキルタグ（カンマ区切り）
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="例: Ruby, TypeScript, React"
          />
        </label>
        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          掲載する
        </button>
      </form>
    </div>
  );
}
