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

  # Any label not in the map above falls back to the "research" category,
  # cycling through its subcategories (research_and_development, analysis,
  # other_specialist) per profile so unmapped rows on the same profile never
  # collide on the unique index on (student_profile_id, job_subcategory)
  # added by a later migration in this set. A profile can have at most
  # StudentDesiredRole::MAX_PRIORITY (3) roles, matching the subcategory count.
  FALLBACK_CATEGORY = "research"
  FALLBACK_SUBCATEGORIES = %w[research_and_development analysis other_specialist].freeze

  def up
    rows = execute("SELECT id, student_profile_id, role FROM student_desired_roles").to_a
    fallback_counts = Hash.new(0)

    rows.each do |row|
      category, subcategory = LEGACY_TEXT_TO_TAXONOMY[row["role"]]

      if category.nil?
        profile_id = row["student_profile_id"]
        index = fallback_counts[profile_id]
        fallback_counts[profile_id] += 1
        category = FALLBACK_CATEGORY
        subcategory = FALLBACK_SUBCATEGORIES[index % FALLBACK_SUBCATEGORIES.length]
      end

      execute(<<~SQL.squish)
        UPDATE student_desired_roles
        SET job_category = #{quote(category)}, job_subcategory = #{quote(subcategory)}
        WHERE id = #{row['id'].to_i}
      SQL
    end
  end

  # Only rows whose (job_category, job_subcategory) matches a value in
  # LEGACY_TEXT_TO_TAXONOMY can be restored to their original free-text label;
  # rows backfilled via the FALLBACK_* constants above have no recoverable
  # original text and are left with a NULL role on rollback.
  def down
    reverse_map = LEGACY_TEXT_TO_TAXONOMY.each_with_object({}) { |(text, pair), acc| acc[pair] = text }

    rows = execute("SELECT id, job_category, job_subcategory FROM student_desired_roles").to_a
    rows.each do |row|
      role = reverse_map[[row["job_category"], row["job_subcategory"]]]
      next if role.nil?

      execute("UPDATE student_desired_roles SET role = #{quote(role)} WHERE id = #{row['id'].to_i}")
    end

    execute("UPDATE student_desired_roles SET job_category = NULL, job_subcategory = NULL")
  end
end
