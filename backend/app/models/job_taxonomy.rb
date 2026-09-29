# Master list of job categories (大分類) and subcategories (小分類) shared by
# JobPosting and StudentDesiredRole. Kept as a plain constant rather than a
# database table: the category set changes rarely, and a prototype with a
# handful of records does not need admin-managed taxonomy rows.
class JobTaxonomy
  RAW_CATEGORIES = {
    "engineering" => {
      label: "エンジニア",
      subcategories: {
        "backend" => "バックエンド",
        "frontend" => "フロントエンド",
        "fullstack" => "フルスタック",
        "mobile" => "モバイル",
        "infra_sre" => "インフラ・SRE",
        "data" => "データ",
        "machine_learning" => "機械学習",
        "qa" => "QA"
      }
    },
    "design" => {
      label: "デザイン・クリエイティブ",
      subcategories: {
        "ui_ux" => "UI/UX",
        "graphic" => "グラフィック",
        "video" => "映像",
        "writer_editor" => "ライター・編集"
      }
    },
    "planning_marketing" => {
      label: "企画・マーケティング",
      subcategories: {
        "business_planning" => "事業企画",
        "product_planning" => "商品企画",
        "web_marketing" => "Webマーケティング",
        "pr" => "広報・PR"
      }
    },
    "sales_cs" => {
      label: "営業・カスタマーサクセス",
      subcategories: {
        "field_sales" => "法人営業",
        "inside_sales" => "インサイドセールス",
        "customer_success" => "カスタマーサクセス"
      }
    },
    "corporate" => {
      label: "コーポレート",
      subcategories: {
        "hr" => "人事",
        "finance_accounting" => "経理・財務",
        "legal" => "法務",
        "general_affairs" => "総務"
      }
    },
    "research" => {
      label: "研究・専門職",
      subcategories: {
        "research_and_development" => "研究開発",
        "analysis" => "分析",
        "other_specialist" => "その他専門職"
      }
    }
  }.freeze

  # Deep-frozen so nothing downstream can mutate the shared taxonomy at runtime.
  CATEGORIES = RAW_CATEGORIES.transform_values { |data| data.merge(subcategories: data[:subcategories].freeze).freeze }.freeze

  class << self
    def category_keys
      CATEGORIES.keys
    end

    def category_label(category)
      CATEGORIES.dig(category, :label)
    end

    def subcategory_keys(category)
      CATEGORIES.dig(category, :subcategories)&.keys || []
    end

    def subcategory_label(category, subcategory)
      CATEGORIES.dig(category, :subcategories, subcategory)
    end

    def valid_pair?(category, subcategory)
      subcategory_keys(category).include?(subcategory)
    end

    def category_for_subcategory(subcategory)
      CATEGORIES.find { |_key, data| data[:subcategories].key?(subcategory) }&.first
    end

    def all_subcategory_keys
      CATEGORIES.values.flat_map { |data| data[:subcategories].keys }
    end
  end
end
