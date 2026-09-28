"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateBasicInfo, ApiError, Intern, SchoolType } from "@/lib/api";
import { SCHOOL_TYPE_LABELS } from "@/lib/profile-labels";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";
import { FieldError } from "@/components/FieldError";

const SCHOOL_TYPE_OPTIONS: SchoolType[] = [
  "university",
  "graduate_school",
  "vocational_school",
  "technical_college",
  "other",
];

export function BasicInfoForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const [schoolType, setSchoolType] = useState<SchoolType | "">(intern.basic_info.school_type ?? "");
  const [schoolName, setSchoolName] = useState(intern.basic_info.school_name ?? "");
  const [department, setDepartment] = useState(intern.basic_info.department ?? "");
  const [graduationYearMonth, setGraduationYearMonth] = useState(
    intern.basic_info.graduation_year_month?.slice(0, 7) ?? ""
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const isDirty =
    schoolType !== (intern.basic_info.school_type ?? "") ||
    schoolName !== (intern.basic_info.school_name ?? "") ||
    department !== (intern.basic_info.department ?? "") ||
    graduationYearMonth !== (intern.basic_info.graduation_year_month?.slice(0, 7) ?? "");
  const { confirmDiscard } = useUnsavedChangesGuard(isDirty);

  const handleCancel = () => {
    if (!confirmDiscard()) return;
    router.push("/mypage");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const updated = await updateBasicInfo(token, intern.id, {
        school_type: schoolType || null,
        school_name: schoolName,
        department,
        graduation_year_month: graduationYearMonth ? `${graduationYearMonth}-01` : null,
      });
      updateAccount(updated, token);
      router.push("/mypage");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        setFieldErrors(err.fieldErrors);
      } else {
        setErrors(["更新に失敗しました"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-wide">
      <label>
        学校種別
        <select value={schoolType} onChange={(e) => setSchoolType(e.target.value as SchoolType)}>
          <option value="">指定なし</option>
          {SCHOOL_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {SCHOOL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        学校名
        <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="例: ○○大学" />
        <FieldError messages={fieldErrors.school_name} />
      </label>
      <label>
        学部・学科
        <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="例: 工学部情報学科" />
        <FieldError messages={fieldErrors.department} />
      </label>
      <label>
        卒業予定年月
        <input type="month" value={graduationYearMonth} onChange={(e) => setGraduationYearMonth(e.target.value)} />
        <FieldError messages={fieldErrors.graduation_year_month} />
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
        <button type="button" className="btn-secondary" onClick={handleCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
}
