class ReplaceJobCategoryOnJobPostings < ActiveRecord::Migration[8.1]
  # Reverse of the mapping in BackfillJobPostingsTaxonomy, used only to
  # restore the legacy integer enum value on rollback.
  TAXONOMY_TO_LEGACY_ENUM = {
    %w[engineering backend] => 0,
    %w[engineering frontend] => 1,
    %w[engineering mobile] => 2,
    %w[engineering infra_sre] => 3,
    %w[engineering data] => 4,
    %w[design ui_ux] => 5
  }.freeze

  def up
    remove_column :job_postings, :job_category, :integer
    rename_column :job_postings, :job_category_key, :job_category
    rename_column :job_postings, :job_subcategory_key, :job_subcategory
  end

  def down
    rename_column :job_postings, :job_subcategory, :job_subcategory_key
    rename_column :job_postings, :job_category, :job_category_key
    add_column :job_postings, :job_category, :integer

    rows = execute("SELECT id, job_category_key, job_subcategory_key FROM job_postings").to_a
    rows.each do |row|
      legacy_value = TAXONOMY_TO_LEGACY_ENUM[[row["job_category_key"], row["job_subcategory_key"]]]
      next if legacy_value.nil?

      execute("UPDATE job_postings SET job_category = #{legacy_value} WHERE id = #{row['id'].to_i}")
    end
  end
end
