class CreateJobApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :job_applications do |t|
      t.references :job_posting, null: false, foreign_key: true
      t.references :intern, null: false, foreign_key: true

      t.timestamps
    end

    add_index :job_applications, %i[job_posting_id intern_id], unique: true
  end
end
