class AddDetailsToJobPostings < ActiveRecord::Migration[8.1]
  def change
    add_column :job_postings, :graduation_year, :integer
    add_column :job_postings, :starts_on, :date
    add_column :job_postings, :ends_on, :date
    add_column :job_postings, :work_style, :integer
    add_column :job_postings, :location, :string
    add_column :job_postings, :job_category, :integer
    add_column :job_postings, :skills, :string, array: true, default: [], null: false

    add_index :job_postings, :graduation_year
    add_index :job_postings, :work_style
    add_index :job_postings, :job_category
    add_index :job_postings, :skills, using: :gin
  end
end
