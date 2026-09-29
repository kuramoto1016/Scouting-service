class BackfillStudentDesiredRolesTaxonomy < ActiveRecord::Migration[8.1]
  # Best-effort mapping from the free-text role labels that existed before this
  # migration to the new job category/subcategory taxonomy. These keys match
  # the exact suggestion strings the old DesiredRolePicker/JobTypePicker
  # components offered (existing rows are prototype seed data only).
  LEGACY_TEXT_TO_TAXONOMY = {
    "バックエンドエンジニア" => %w[engineering backend],
    "フロントエンドエンジニア" => %w[engineering frontend],
    "フルスタックエンジニア" => %w[engineering fullstack],
    "モバイルアプリエンジニア" => %w[engineering mobile],
    "インフラ・SREエンジニア" => %w[engineering infra_sre],
    "データサイエンティスト" => %w[engineering data],
    "機械学習エンジニア" => %w[engineering machine_learning],
    "QA・テストエンジニア" => %w[engineering qa],
    "UI/UXデザイナー" => %w[design ui_ux],
    "プロダクトマネージャー" => %w[planning_marketing product_planning]
  }.freeze

  # Any label not in the map above keeps its original text in job_subcategory
  # so the legacy free-text role can be restored if this migration is rolled
  # back after the role column has been removed and re-added.
  FALLBACK_CATEGORY = "research"

  def up
    rows = execute("SELECT id, role FROM student_desired_roles").to_a

    rows.each do |row|
      category, subcategory = LEGACY_TEXT_TO_TAXONOMY[row["role"]]

      if category.nil?
        category = FALLBACK_CATEGORY
        subcategory = row["role"]
      end

      execute(<<~SQL.squish)
        UPDATE student_desired_roles
        SET job_category = #{quote(category)}, job_subcategory = #{quote(subcategory)}
        WHERE id = #{row['id'].to_i}
      SQL
    end
  end

  def down
    reverse_map = LEGACY_TEXT_TO_TAXONOMY.each_with_object({}) { |(text, pair), acc| acc[pair] = text }

    rows = execute("SELECT id, job_category, job_subcategory FROM student_desired_roles").to_a
    rows.each do |row|
      role = reverse_map[[row["job_category"], row["job_subcategory"]]] || row["job_subcategory"]

      execute("UPDATE student_desired_roles SET role = #{quote(role)} WHERE id = #{row['id'].to_i}")
    end

    execute("UPDATE student_desired_roles SET job_category = NULL, job_subcategory = NULL")
  end
end
