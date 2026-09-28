class RemoveProfileFieldsFromInterns < ActiveRecord::Migration[8.1]
  def change
    remove_column :interns, :university, :string
    remove_column :interns, :faculty, :string
    remove_column :interns, :grade, :string
    remove_column :interns, :bio, :text
    remove_column :interns, :career_goal, :text
    remove_column :interns, :desired_location, :string
    remove_column :interns, :job_hunting_axes, :string
    remove_column :interns, :skills, :string
    remove_column :interns, :desired_job_type, :string
    remove_column :interns, :portfolio_url, :string
  end
end
