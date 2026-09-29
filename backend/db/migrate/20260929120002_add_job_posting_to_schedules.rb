class AddJobPostingToSchedules < ActiveRecord::Migration[8.1]
  def change
    add_reference :schedules, :job_posting, foreign_key: true
  end
end
