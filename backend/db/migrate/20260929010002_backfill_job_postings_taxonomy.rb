class BackfillJobPostingsTaxonomy < ActiveRecord::Migration[8.1]
  LEGACY_ENUM_VALUES = { 0 => "backend", 1 => "frontend", 2 => "mobile", 3 => "infra", 4 => "data", 5 => "design" }.freeze

  LEGACY_TO_TAXONOMY = {
    "backend" => %w[engineering backend],
    "frontend" => %w[engineering frontend],
    "mobile" => %w[engineering mobile],
    "infra" => %w[engineering infra_sre],
    "data" => %w[engineering data],
    "design" => %w[design ui_ux]
  }.freeze

  def up
    job_postings = execute("SELECT id, job_category FROM job_postings WHERE job_category IS NOT NULL").to_a

    job_postings.each do |row|
      legacy_key = LEGACY_ENUM_VALUES[row["job_category"].to_i]
      category, subcategory = LEGACY_TO_TAXONOMY[legacy_key]
      next unless category

      execute(<<~SQL.squish)
        UPDATE job_postings
        SET job_category_key = #{quote(category)}, job_subcategory_key = #{quote(subcategory)}
        WHERE id = #{row['id'].to_i}
      SQL
    end
  end

  def down
    execute("UPDATE job_postings SET job_category_key = NULL, job_subcategory_key = NULL")
  end
end
