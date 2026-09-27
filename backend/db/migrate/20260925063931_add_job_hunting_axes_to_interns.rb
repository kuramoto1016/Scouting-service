class AddJobHuntingAxesToInterns < ActiveRecord::Migration[8.1]
  def change
    add_column :interns, :job_hunting_axes, :string
  end
end
