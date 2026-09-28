class CreateStudentSkills < ActiveRecord::Migration[8.1]
  def change
    create_table :student_skills do |t|
      t.references :student_profile, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :category, null: false
      t.integer :level, null: false

      t.timestamps
    end

    add_index :student_skills, [ :student_profile_id, :name ], unique: true
  end
end
