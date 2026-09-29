class AddTaxonomyColumnsToStudentDesiredRoles < ActiveRecord::Migration[8.1]
  def change
    add_column :student_desired_roles, :job_category, :string
    add_column :student_desired_roles, :job_subcategory, :string
  end
end
