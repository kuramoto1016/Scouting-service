class AddTaxonomyColumnsToJobPostings < ActiveRecord::Migration[8.1]
  def change
    add_column :job_postings, :job_category_key, :string
    add_column :job_postings, :job_subcategory_key, :string
    add_index :job_postings, :job_category_key
    add_index :job_postings, :job_subcategory_key
  end
end
