class AddProfileFieldsToInterns < ActiveRecord::Migration[8.1]
  def change
    add_column :interns, :university, :string
    add_column :interns, :faculty, :string
    add_column :interns, :grade, :string
    add_column :interns, :skills, :string
    add_column :interns, :desired_location, :string
    add_column :interns, :desired_job_type, :string
  end
end
