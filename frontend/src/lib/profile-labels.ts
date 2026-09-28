import { SchoolType, SkillCategory, SkillLevel, PortfolioContext, ProfileSection } from "./api";

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  university: "大学",
  graduate_school: "大学院",
  vocational_school: "専門学校",
  technical_college: "高等専門学校",
  other: "その他",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "言語",
  framework: "フレームワーク",
  tool: "ツール",
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  class_experience: "授業レベル",
  personal: "個人開発レベル",
  team: "チーム開発レベル",
};

export const PORTFOLIO_CONTEXT_LABELS: Record<PortfolioContext, string> = {
  class_project: "授業課題",
  personal: "個人開発",
  hackathon: "ハッカソン",
  intern: "インターン",
  other: "その他",
};

export const SECTION_LABELS: Record<ProfileSection, string> = {
  basic_info: "基本情報",
  desired_conditions: "希望条件",
  skills: "スキル",
  portfolio_items: "制作物",
  self_pr: "自己PR・キャリア",
  links: "リンク",
};

export function formatGraduationYearMonth(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return `${d.getFullYear()}年${d.getMonth() + 1}月卒業予定`;
}
