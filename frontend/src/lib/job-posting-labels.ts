import { WorkStyle } from "./api";
import { JobCategoryKey, JOB_CATEGORY_KEYS } from "./job-taxonomy";

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  online: "オンライン",
  onsite: "出社",
  hybrid: "ハイブリッド",
};

export const WORK_STYLE_OPTIONS: WorkStyle[] = ["online", "onsite", "hybrid"];

export const JOB_CATEGORY_GRADIENTS: Record<JobCategoryKey, string> = {
  engineering: "linear-gradient(135deg, #1ba7e0, #054a66)",
  design: "linear-gradient(135deg, #93c5fd, #1e40af)",
  planning_marketing: "linear-gradient(135deg, #fbbf24, #b45309)",
  sales_cs: "linear-gradient(135deg, #86efac, #15803d)",
  corporate: "linear-gradient(135deg, #c4b5fd, #5b21b6)",
  research: "linear-gradient(135deg, #a5f3fc, #0891b2)",
};

export const JOB_CATEGORY_ICONS: Record<JobCategoryKey, string> = {
  engineering: "⚙",
  design: "✦",
  planning_marketing: "◆",
  sales_cs: "◎",
  corporate: "▣",
  research: "◈",
};

export const JOB_CATEGORY_OPTIONS: JobCategoryKey[] = JOB_CATEGORY_KEYS;

export function formatDateRange(startsOn: string | null, endsOn: string | null): string | null {
  if (!startsOn && !endsOn) return null;
  const format = (iso: string) => {
    const [year, month, day] = iso.split("-");
    if (year && month && day) return `${Number(month)}/${Number(day)}`;

    return iso;
  };
  if (startsOn && endsOn) return `${format(startsOn)}〜${format(endsOn)}`;
  if (startsOn) return `${format(startsOn)}〜`;
  return `〜${format(endsOn as string)}`;
}
