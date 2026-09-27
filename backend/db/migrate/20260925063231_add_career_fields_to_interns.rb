class AddCareerFieldsToInterns < ActiveRecord::Migration[8.1]
  def change
    add_column :interns, :portfolio_url, :string
    add_column :interns, :career_goal, :text
  end
end
