export const JOB_TAXONOMY = {
  engineering: {
    label: "エンジニア",
    subcategories: {
      backend: "バックエンド",
      frontend: "フロントエンド",
      fullstack: "フルスタック",
      mobile: "モバイル",
      infra_sre: "インフラ・SRE",
      data: "データ",
      machine_learning: "機械学習",
      qa: "QA",
    },
  },
  design: {
    label: "デザイン・クリエイティブ",
    subcategories: {
      ui_ux: "UI/UX",
      graphic: "グラフィック",
      video: "映像",
      writer_editor: "ライター・編集",
    },
  },
  planning_marketing: {
    label: "企画・マーケティング",
    subcategories: {
      business_planning: "事業企画",
      product_planning: "商品企画",
      web_marketing: "Webマーケティング",
      pr: "広報・PR",
    },
  },
  sales_cs: {
    label: "営業・カスタマーサクセス",
    subcategories: {
      field_sales: "法人営業",
      inside_sales: "インサイドセールス",
      customer_success: "カスタマーサクセス",
    },
  },
  corporate: {
    label: "コーポレート",
    subcategories: {
      hr: "人事",
      finance_accounting: "経理・財務",
      legal: "法務",
      general_affairs: "総務",
    },
  },
  research: {
    label: "研究・専門職",
    subcategories: {
      research_and_development: "研究開発",
      analysis: "分析",
      other_specialist: "その他専門職",
    },
  },
} as const;

export type JobCategoryKey = keyof typeof JOB_TAXONOMY;
export type JobSubcategoryKey<C extends JobCategoryKey = JobCategoryKey> =
  keyof (typeof JOB_TAXONOMY)[C];

export const JOB_CATEGORY_KEYS = Object.keys(JOB_TAXONOMY) as JobCategoryKey[];

export function jobCategoryLabel(category: string | null): string | null {
  if (!category || !(category in JOB_TAXONOMY)) return null;
  return JOB_TAXONOMY[category as JobCategoryKey].label;
}

export function jobSubcategoryLabel(category: string | null, subcategory: string | null): string | null {
  if (!category || !subcategory || !(category in JOB_TAXONOMY)) return null;
  const subcategories = JOB_TAXONOMY[category as JobCategoryKey].subcategories as Record<string, string>;
  return subcategories[subcategory] ?? null;
}

export function subcategoryKeysFor(category: string | null): string[] {
  if (!category || !(category in JOB_TAXONOMY)) return [];
  return Object.keys(JOB_TAXONOMY[category as JobCategoryKey].subcategories);
}

export function categoryForSubcategory(subcategory: string | null): JobCategoryKey | null {
  if (!subcategory) return null;
  const found = JOB_CATEGORY_KEYS.find((category) =>
    Object.keys(JOB_TAXONOMY[category].subcategories).includes(subcategory)
  );
  return found ?? null;
}
