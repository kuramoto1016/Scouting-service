class StudentSkill < ApplicationRecord
  belongs_to :student_profile

  enum :category, { language: 0, framework: 1, tool: 2 }, validate: true
  enum :level, { class_experience: 0, personal: 1, team: 2 }, prefix: :level, validate: true

  validates :name, presence: true, uniqueness: { scope: :student_profile_id }
  validates :category, presence: true
  validates :level, presence: true
end
