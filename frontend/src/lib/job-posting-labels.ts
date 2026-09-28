import { JobCategory, WorkStyle } from "./api";

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  online: "オンライン",
  onsite: "出社",
  hybrid: "ハイブリッド",
};

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  backend: "バックエンド",
  frontend: "フロントエンド",
  mobile: "モバイル",
  infra: "インフラ",
  data: "データ",
  design: "デザイン",
};

export const JOB_CATEGORY_GRADIENTS: Record<JobCategory, string> = {
  backend: "linear-gradient(135deg, #1ba7e0, #054a66)",
  frontend: "linear-gradient(135deg, #6ee7f2, #1ba7e0)",
  mobile: "linear-gradient(135deg, #7dd3fc, #0369a1)",
  infra: "linear-gradient(135deg, #38bdf8, #0c4a6e)",
  data: "linear-gradient(135deg, #a5f3fc, #0891b2)",
  design: "linear-gradient(135deg, #93c5fd, #1e40af)",
};

export const JOB_CATEGORY_ICONS: Record<JobCategory, string> = {
  backend: "⚙",
  frontend: "▢",
  mobile: "□",
  infra: "☁",
  data: "◈",
  design: "✦",
};

export const WORK_STYLE_OPTIONS: WorkStyle[] = ["online", "onsite", "hybrid"];
export const JOB_CATEGORY_OPTIONS: JobCategory[] = ["backend", "frontend", "mobile", "infra", "data", "design"];

export function formatDateRange(startsOn: string | null, endsOn: string | null): string | null {
  if (!startsOn && !endsOn) return null;
  const format = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  if (startsOn && endsOn) return `${format(startsOn)}〜${format(endsOn)}`;
  if (startsOn) return `${format(startsOn)}〜`;
  return `〜${format(endsOn as string)}`;
}
