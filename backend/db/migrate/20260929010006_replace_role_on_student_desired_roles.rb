class ReplaceRoleOnStudentDesiredRoles < ActiveRecord::Migration[8.1]
  def up
    remove_index :student_desired_roles, %i[student_profile_id role]
    remove_column :student_desired_roles, :role, :string

    change_column_null :student_desired_roles, :job_category, false
    change_column_null :student_desired_roles, :job_subcategory, false
    add_index :student_desired_roles, %i[student_profile_id job_subcategory],
              unique: true, name: "index_desired_roles_on_profile_and_subcategory"
  end

  def down
    remove_index :student_desired_roles, name: "index_desired_roles_on_profile_and_subcategory"
    add_column :student_desired_roles, :role, :string
    change_column_null :student_desired_roles, :job_category, true
    change_column_null :student_desired_roles, :job_subcategory, true
    add_index :student_desired_roles, %i[student_profile_id role], unique: true, name: "index_desired_roles_on_profile_and_role"
  end
end
