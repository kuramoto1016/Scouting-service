class ReplaceJobCategoryOnJobPostings < ActiveRecord::Migration[8.1]
  def up
    remove_column :job_postings, :job_category, :integer
    rename_column :job_postings, :job_category_key, :job_category
    rename_column :job_postings, :job_subcategory_key, :job_subcategory
  end

  def down
    rename_column :job_postings, :job_subcategory, :job_subcategory_key
    rename_column :job_postings, :job_category, :job_category_key
    add_column :job_postings, :job_category, :integer
  end
end
