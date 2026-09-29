"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchSchedules, Schedule } from "@/lib/api";
import { SCHEDULE_STATUS_LABELS, formatSlotDateTime } from "@/lib/schedule-labels";

export default function SchedulesPage() {
  const { token, accountType, loading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    fetchSchedules(token)
      .then(setSchedules)
      .catch(() => setError("予定調整一覧の取得に失敗しました"))
      .finally(() => setLoadingSchedules(false));
  }, [token]);

  if (loading || !token) return null;

  return (
    <div>
      <h1 className="page-title">予定調整</h1>
      {accountType === "company" && (
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/schedules/new" className="btn-primary">
            日程調整を作成する
          </Link>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {loadingSchedules && <p className="muted">読み込み中...</p>}
      {!loadingSchedules && schedules.length === 0 && (
        <p className="muted">予定調整はまだありません。</p>
      )}
      {schedules.map((schedule) => {
        const confirmedSlot = schedule.slots.find((slot) => slot.id === schedule.confirmed_slot_id);
        return (
          <Link key={schedule.id} href={`/schedules/${schedule.id}`} className="card" style={{ display: "block" }}>
            <div className="card-title">{schedule.title}</div>
            <div className="card-meta">
              {accountType === "company"
                ? schedule.interns.map((i) => i.name).join("、")
                : schedule.company.name}
              {" ・ "}
              {SCHEDULE_STATUS_LABELS[schedule.status]}
            </div>
            {confirmedSlot && (
              <p className="muted" style={{ marginTop: "0.3rem" }}>
                確定日時: {formatSlotDateTime(confirmedSlot.starts_at, confirmedSlot.ends_at)}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
