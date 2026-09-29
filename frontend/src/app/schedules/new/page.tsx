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

type ParsedSlot = { starts_at: string; ends_at: string };
type SlotParseResult = { slot: ParsedSlot | null; error: string | null };

function emptySlot(): SlotDraft {
  return { date: "", startTime: "", endTime: "" };
}

function isMatchingLocalDateTime(value: Date, date: string, time: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return (
    value.getFullYear() === year &&
    value.getMonth() + 1 === month &&
    value.getDate() === day &&
    value.getHours() === hour &&
    value.getMinutes() === minute
  );
}

function slotToIso(slot: SlotDraft): SlotParseResult | null {
  if (!slot.date || !slot.startTime || !slot.endTime) return null;
  const startsAt = new Date(`${slot.date}T${slot.startTime}`);
  const endsAt = new Date(`${slot.date}T${slot.endTime}`);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    !isMatchingLocalDateTime(startsAt, slot.date, slot.startTime) ||
    !isMatchingLocalDateTime(endsAt, slot.date, slot.endTime)
  ) {
    return { slot: null, error: "候補日時に不正な日付または時刻が含まれています" };
  }

  return {
    slot: {
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    },
    error: null,
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

    const slotResults = slots.map(slotToIso).filter((result): result is SlotParseResult => result !== null);
    const invalidSlot = slotResults.find((result) => result.error);
    if (invalidSlot?.error) {
      setErrors([invalidSlot.error]);
      return;
    }

    const parsedSlots = slotResults.map((result) => result.slot).filter((slot): slot is ParsedSlot => slot !== null);
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
          {slots.map((slot, index) => {
            const dateId = `schedule-slot-${index}-date`;
            const startTimeId = `schedule-slot-${index}-start-time`;
            const endTimeId = `schedule-slot-${index}-end-time`;
            const candidateLabel = `候補${index + 1}`;

            return (
              <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor={dateId}>
                  {candidateLabel} 日付
                  <input
                    id={dateId}
                    type="date"
                    value={slot.date}
                    onChange={(e) => updateSlot(index, { date: e.target.value })}
                    required
                  />
                </label>
                <label htmlFor={startTimeId}>
                  {candidateLabel} 開始時刻
                  <input
                    id={startTimeId}
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, { startTime: e.target.value })}
                    required
                  />
                </label>
                <span>〜</span>
                <label htmlFor={endTimeId}>
                  {candidateLabel} 終了時刻
                  <input
                    id={endTimeId}
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, { endTime: e.target.value })}
                    required
                  />
                </label>
                {slots.length > 1 && (
                  <button type="button" className="btn-secondary" onClick={() => removeSlot(index)}>
                    削除
                  </button>
                )}
              </div>
            );
          })}
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
