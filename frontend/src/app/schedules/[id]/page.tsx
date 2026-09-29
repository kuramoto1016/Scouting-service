"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchSchedule,
  confirmSchedule,
  cancelSchedule,
  respondToScheduleSlot,
  Schedule,
  ScheduleAnswer,
  ApiError,
} from "@/lib/api";
import {
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_ANSWER_LABELS,
  SCHEDULE_ANSWER_OPTIONS,
  formatSlotDateTime,
} from "@/lib/schedule-labels";

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>();
  const scheduleId = Number(params.id);

  const { token, accountType, account, loading } = useAuth();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  const loadSchedule = useCallback(() => {
    if (!token) return;
    fetchSchedule(token, scheduleId)
      .then(setSchedule)
      .catch(() => setError("予定調整の取得に失敗しました"))
      .finally(() => setLoadingSchedule(false));
  }, [token, scheduleId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleConfirm = async (slotId: number) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await confirmSchedule(token, scheduleId, slotId);
      setSchedule(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "確定に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await cancelSchedule(token, scheduleId);
      setSchedule(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "キャンセルに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (slotId: number, answer: ScheduleAnswer) => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await respondToScheduleSlot(token, scheduleId, slotId, answer);
      loadSchedule();
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "回答の送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !token) return null;
  if (loadingSchedule) return <p className="muted">読み込み中...</p>;
  if (!schedule) return <p className="error-text">{error ?? "予定調整が見つかりませんでした"}</p>;

  const isCompanyOwner = accountType === "company";
  const currentInternId = accountType === "intern" ? account?.id : null;

  return (
    <div>
      <Link href="/schedules" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← 予定調整一覧に戻る
      </Link>
      <h1 className="page-title">{schedule.title}</h1>
      <p className="card-meta" style={{ marginBottom: "1rem" }}>
        {isCompanyOwner ? schedule.interns.map((i) => i.name).join("、") : schedule.company.name}
        {" ・ "}
        {SCHEDULE_STATUS_LABELS[schedule.status]}
      </p>

      {error && <p className="error-text">{error}</p>}

      <div className="portfolio-item-list">
        {schedule.slots.map((slot) => {
          const isConfirmed = schedule.confirmed_slot_id === slot.id;
          const myResponse = slot.responses?.find((r) => r.intern_id === currentInternId);

          return (
            <div key={slot.id} className={`card portfolio-item-card ${isConfirmed ? "schedule-slot-confirmed" : ""}`}>
              <div className="card-title">
                {formatSlotDateTime(slot.starts_at, slot.ends_at)}
                {isConfirmed && <span className="tag" style={{ marginLeft: "0.5rem" }}>確定</span>}
              </div>

              {isCompanyOwner && slot.responses && (
                <div className="tag-list" style={{ marginTop: "0.5rem" }}>
                  {schedule.interns.map((intern) => {
                    const response = slot.responses?.find((r) => r.intern_id === intern.id);
                    return (
                      <span key={intern.id} className="tag tag-outline">
                        {intern.name}: {response ? SCHEDULE_ANSWER_LABELS[response.answer] : "未回答"}
                      </span>
                    );
                  })}
                </div>
              )}

              {isCompanyOwner && schedule.status === "open" && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => handleConfirm(slot.id)}
                  disabled={submitting}
                >
                  この日程で確定する
                </button>
              )}

              {!isCompanyOwner && schedule.status === "open" && (
                <div className="skill-level-toggle" style={{ marginTop: "0.5rem" }}>
                  {SCHEDULE_ANSWER_OPTIONS.map((answer) => (
                    <button
                      key={answer}
                      type="button"
                      className={myResponse?.answer === answer ? "active" : ""}
                      onClick={() => handleRespond(slot.id, answer)}
                      disabled={submitting}
                      aria-pressed={myResponse?.answer === answer}
                    >
                      {SCHEDULE_ANSWER_LABELS[answer]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCompanyOwner && schedule.status === "open" && (
        <button type="button" className="btn-secondary" style={{ marginTop: "1rem" }} onClick={handleCancel} disabled={submitting}>
          この日程調整をキャンセルする
        </button>
      )}
    </div>
  );
}
