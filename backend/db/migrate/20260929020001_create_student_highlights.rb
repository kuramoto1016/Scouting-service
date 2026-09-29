class CreateStudentHighlights < ActiveRecord::Migration[8.1]
  def change
    create_table :student_highlights do |t|
      t.references :student_profile, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body, null: false
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :student_highlights, %i[student_profile_id position]
  end
end
