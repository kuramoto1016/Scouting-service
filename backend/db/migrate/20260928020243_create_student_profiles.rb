class CreateStudentProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :student_profiles do |t|
      t.references :intern, null: false, foreign_key: true, index: { unique: true }
      t.integer :school_type
      t.string :school_name
      t.string :department
      t.date :graduation_year_month
      t.text :bio
      t.text :career_goal
      t.string :desired_location
      t.string :job_hunting_axes

      t.timestamps
    end
  end
end
