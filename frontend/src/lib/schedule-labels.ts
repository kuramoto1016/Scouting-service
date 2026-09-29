import { ScheduleAnswer, ScheduleStatus } from "./api";

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  open: "調整中",
  confirmed: "確定済み",
  cancelled: "キャンセル",
};

export const SCHEDULE_ANSWER_LABELS: Record<ScheduleAnswer, string> = {
  available: "◯ 参加可能",
  unavailable: "× 参加不可",
  maybe: "△ 未定",
};

export const SCHEDULE_ANSWER_OPTIONS: ScheduleAnswer[] = ["available", "maybe", "unavailable"];

export function formatSlotDateTime(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" });
  return `${dateFormatter.format(start)} ${timeFormatter.format(start)}〜${timeFormatter.format(end)}`;
}
