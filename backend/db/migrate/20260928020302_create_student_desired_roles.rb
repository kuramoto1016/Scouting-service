class CreateStudentDesiredRoles < ActiveRecord::Migration[8.1]
  def change
    create_table :student_desired_roles do |t|
      t.references :student_profile, null: false, foreign_key: true
      t.string :role, null: false
      t.integer :priority, null: false

      t.timestamps
    end

    add_index :student_desired_roles, [ :student_profile_id, :priority ], unique: true,
              name: "index_desired_roles_on_profile_and_priority"
    add_index :student_desired_roles, [ :student_profile_id, :role ], unique: true,
              name: "index_desired_roles_on_profile_and_role"
  end
end
