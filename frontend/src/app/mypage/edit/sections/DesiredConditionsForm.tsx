"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateDesiredConditions, ApiError, Intern, DesiredRole } from "@/lib/api";
import { DesiredRolePicker } from "@/components/DesiredRolePicker";
import { LocationPicker } from "@/components/LocationPicker";
import { JobHuntingAxisPicker } from "@/components/JobHuntingAxisPicker";
import { TagPickerHandle } from "@/components/TagPicker";

export function DesiredConditionsForm({ intern }: { intern: Intern }) {
  const { token, updateAccount } = useAuth();
  const router = useRouter();

  const [desiredRoles, setDesiredRoles] = useState<DesiredRole[]>(intern.desired_conditions.desired_roles);
  const [desiredLocation, setDesiredLocation] = useState(intern.desired_conditions.desired_location ?? "");
  const [jobHuntingAxes, setJobHuntingAxes] = useState(intern.desired_conditions.job_hunting_axes ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const axisPickerRef = useRef<TagPickerHandle>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);
    const committedAxes = axisPickerRef.current?.commitPendingInput() ?? jobHuntingAxes;
    try {
      const updated = await updateDesiredConditions(token, intern.id, {
        desired_roles: desiredRoles,
        desired_location: desiredLocation,
        job_hunting_axes: committedAxes,
      });
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
      <fieldset className="picker-fieldset">
        <legend>希望職種（優先順位付き）</legend>
        <DesiredRolePicker value={desiredRoles} onChange={setDesiredRoles} />
      </fieldset>
      <fieldset className="picker-fieldset">
        <legend>希望勤務地</legend>
        <LocationPicker value={desiredLocation} onChange={setDesiredLocation} />
      </fieldset>
      <fieldset className="picker-fieldset">
        <legend>就活の軸（企業選びで重視すること）</legend>
        <JobHuntingAxisPicker ref={axisPickerRef} value={jobHuntingAxes} onChange={setJobHuntingAxes} />
      </fieldset>
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
