"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateInternProfile, ApiError, Intern } from "@/lib/api";
import { SkillPicker } from "@/components/SkillPicker";
import { JobTypePicker } from "@/components/JobTypePicker";

export default function EditProfilePage() {
  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (accountType !== "intern") {
      router.push("/mypage");
    }
  }, [loading, token, accountType, router]);

  if (loading || !token || accountType !== "intern" || !account) return null;

  return <EditProfileForm intern={account as Intern} />;
}

function EditProfileForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();

  const [name, setName] = useState(intern.name ?? "");
  const [bio, setBio] = useState(intern.bio ?? "");
  const [university, setUniversity] = useState(intern.university ?? "");
  const [faculty, setFaculty] = useState(intern.faculty ?? "");
  const [grade, setGrade] = useState(intern.grade ?? "");
  const [skills, setSkills] = useState(intern.skills ?? "");
  const [desiredLocation, setDesiredLocation] = useState(intern.desired_location ?? "");
  const [desiredJobType, setDesiredJobType] = useState(intern.desired_job_type ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await updateInternProfile(token, intern.id, {
        name,
        bio,
        university,
        faculty,
        grade,
        skills,
        desired_location: desiredLocation,
        desired_job_type: desiredJobType,
      });
      if (!mountedRef.current) return;
      updateAccount(updated);
      setSaved(true);
    } catch (err) {
      if (!mountedRef.current) return;
      setErrors(err instanceof ApiError ? err.errors : ["更新に失敗しました"]);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="form-wide">
        <label>
          氏名
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          自己紹介
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label>
          大学名
          <input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="例: ○○大学" />
        </label>
        <label>
          学部
          <input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="例: 工学部情報学科" />
        </label>
        <label>
          学年
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="例: 3年" />
        </label>
        <label>
          スキル・使用可能言語
          <SkillPicker value={skills} onChange={setSkills} />
        </label>
        <label>
          希望勤務地
          <input
            value={desiredLocation}
            onChange={(e) => setDesiredLocation(e.target.value)}
            placeholder="例: 東京都・リモート可"
          />
        </label>
        <label>
          希望職種
          <JobTypePicker value={desiredJobType} onChange={setDesiredJobType} />
        </label>
        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        {saved && <p style={{ color: "var(--accent)", fontSize: "0.9rem" }}>保存しました。</p>}
        <button type="submit" disabled={submitting}>
          保存する
        </button>
      </form>
    </div>
  );
}
