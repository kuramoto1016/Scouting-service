class StudentDesiredRole < ApplicationRecord
  belongs_to :student_profile

  MAX_PRIORITY = 3

  validates :role, presence: true, uniqueness: { scope: :student_profile_id }
  validates :priority,
            presence: true,
            uniqueness: { scope: :student_profile_id },
            inclusion: { in: 1..MAX_PRIORITY }
end
