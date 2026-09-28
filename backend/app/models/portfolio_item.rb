class PortfolioItem < ApplicationRecord
  include ValidatesHttpUrl

  belongs_to :student_profile

  enum :context, {
    class_project: 0,
    personal: 1,
    hackathon: 2,
    intern: 3,
    other: 4
  }, prefix: true

  MAX_ITEMS_PER_PROFILE = 10
  TITLE_MAX_LENGTH = 100
  SUMMARY_MAX_LENGTH = 1000
  HIGHLIGHTS_MAX_LENGTH = 1000

  validates :title, presence: true, length: { maximum: TITLE_MAX_LENGTH }
  validates :summary, length: { maximum: SUMMARY_MAX_LENGTH }
  validates :highlights, length: { maximum: HIGHLIGHTS_MAX_LENGTH }
  validates_http_url :github_url, :other_url
  validate :student_profile_item_limit, on: :create

  before_validation :assign_next_position, on: :create

  private

  def student_profile_item_limit
    return unless student_profile

    if student_profile.portfolio_items.count >= MAX_ITEMS_PER_PROFILE
      errors.add(:base, "制作物は#{MAX_ITEMS_PER_PROFILE}件まで登録できます")
    end
  end

  def assign_next_position
    return if position.present? && position.positive?

    max_position = student_profile&.portfolio_items&.maximum(:position) || 0
    self.position = max_position + 1
  end
end
