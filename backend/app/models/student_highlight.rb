class StudentHighlight < ApplicationRecord
  belongs_to :student_profile

  MAX_HIGHLIGHTS_PER_PROFILE = 3
  TITLE_MAX_LENGTH = 100
  BODY_MAX_LENGTH = 1000

  validates :title, presence: true, length: { maximum: TITLE_MAX_LENGTH }
  validates :body, presence: true, length: { maximum: BODY_MAX_LENGTH }
  validate :student_profile_highlight_limit, on: :create

  before_validation :assign_next_position, on: :create

  private

  def student_profile_highlight_limit
    return unless student_profile

    if student_profile.student_highlights.count >= MAX_HIGHLIGHTS_PER_PROFILE
      errors.add(:base, "学生時代に力を入れたことは#{MAX_HIGHLIGHTS_PER_PROFILE}件まで登録できます")
    end
  end

  def assign_next_position
    return if position.present? && position.positive?

    max_position = student_profile&.student_highlights&.maximum(:position) || 0
    self.position = max_position + 1
  end
end
