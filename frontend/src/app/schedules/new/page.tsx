"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createSchedule, fetchInterns, ApiError, Intern } from "@/lib/api";

interface SlotDraft {
  date: string;
  startTime: string;
  endTime: string;
}

function emptySlot(): SlotDraft {
  return { date: "", startTime: "", endTime: "" };
}

function slotToIso(slot: SlotDraft): { starts_at: string; ends_at: string } | null {
  if (!slot.date || !slot.startTime || !slot.endTime) return null;
  return {
    starts_at: new Date(`${slot.date}T${slot.startTime}`).toISOString(),
    ends_at: new Date(`${slot.date}T${slot.endTime}`).toISOString(),
  };
}

export default function NewSchedulePage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [selectedInternIds, setSelectedInternIds] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotDraft[]>([emptySlot()]);
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

  useEffect(() => {
    if (!token || accountType !== "company") return;
    fetchInterns(token)
      .then(setInterns)
      .catch(() => setInterns([]))
      .finally(() => setLoadingInterns(false));
  }, [token, accountType]);

  const toggleIntern = (internId: number) => {
    setSelectedInternIds((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]
    );
  };

  const updateSlot = (index: number, patch: Partial<SlotDraft>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addSlot = () => setSlots((prev) => [...prev, emptySlot()]);
  const removeSlot = (index: number) => setSlots((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrors([]);

    const parsedSlots = slots.map(slotToIso).filter((s): s is { starts_at: string; ends_at: string } => s !== null);
    if (parsedSlots.length === 0) {
      setErrors(["候補日時を1件以上入力してください"]);
      return;
    }
    if (selectedInternIds.length === 0) {
      setErrors(["対象の学生を1人以上選択してください"]);
      return;
    }

    setSubmitting(true);
    try {
      const schedule = await createSchedule(token, { title, internIds: selectedInternIds, slots: parsedSlots });
      router.push(`/schedules/${schedule.id}`);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : ["日程調整の作成に失敗しました"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !token || accountType !== "company") return null;

  return (
    <div>
      <h1 className="page-title">日程調整を作成する</h1>
      <form onSubmit={handleSubmit} className="form-wide">
        <label>
          タイトル
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 一次面接の日程調整"
            required
          />
        </label>

        <fieldset className="picker-fieldset">
          <legend>候補日時</legend>
          {slots.map((slot, index) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input type="date" value={slot.date} onChange={(e) => updateSlot(index, { date: e.target.value })} required />
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, { startTime: e.target.value })}
                required
              />
              <span>〜</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, { endTime: e.target.value })}
                required
              />
              {slots.length > 1 && (
                <button type="button" className="btn-secondary" onClick={() => removeSlot(index)}>
                  削除
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addSlot}>
            候補日時を追加
          </button>
        </fieldset>

        <fieldset className="picker-fieldset">
          <legend>対象の学生（{selectedInternIds.length}人選択中）</legend>
          {loadingInterns && <p className="muted">読み込み中...</p>}
          {!loadingInterns && interns.length === 0 && <p className="muted">インターン生が見つかりませんでした。</p>}
          {interns.map((intern) => (
            <label key={intern.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <input
                type="checkbox"
                checked={selectedInternIds.includes(intern.id)}
                onChange={() => toggleIntern(intern.id)}
              />
              {intern.name}
            </label>
          ))}
        </fieldset>

        {errors.length > 0 && (
          <div className="error-text">
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          作成する
        </button>
      </form>
    </div>
  );
}
