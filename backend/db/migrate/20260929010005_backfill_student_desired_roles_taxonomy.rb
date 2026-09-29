class BackfillStudentDesiredRolesTaxonomy < ActiveRecord::Migration[8.1]
  # Best-effort mapping from the free-text role labels that existed before this
  # migration to the new job category/subcategory taxonomy. Any label not
  # listed here falls back to "research"/"other_specialist" so no row is left
  # without a valid pair (existing rows are prototype seed data only).
  LEGACY_TEXT_TO_TAXONOMY = {
    "バックエンドエンジニア" => %w[engineering backend],
    "フロントエンドエンジニア" => %w[engineering frontend],
    "フルスタックエンジニア" => %w[engineering fullstack],
    "モバイルエンジニア" => %w[engineering mobile],
    "インフラ・SREエンジニア" => %w[engineering infra_sre],
    "データサイエンティスト" => %w[engineering data],
    "機械学習エンジニア" => %w[engineering machine_learning],
    "QA・テストエンジニア" => %w[engineering qa],
    "UI/UXデザイナー" => %w[design ui_ux],
    "プロダクトマネージャー" => %w[planning_marketing product_planning]
  }.freeze

  FALLBACK = %w[research other_specialist].freeze

  def up
    rows = execute("SELECT id, role FROM student_desired_roles").to_a

    rows.each do |row|
      category, subcategory = LEGACY_TEXT_TO_TAXONOMY[row["role"]] || FALLBACK

      execute(<<~SQL.squish)
        UPDATE student_desired_roles
        SET job_category = #{quote(category)}, job_subcategory = #{quote(subcategory)}
        WHERE id = #{row['id'].to_i}
      SQL
    end
  end

  def down
    execute("UPDATE student_desired_roles SET job_category = NULL, job_subcategory = NULL")
  end
end
