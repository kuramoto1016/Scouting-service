class ScheduleSlot < ApplicationRecord
  belongs_to :schedule
  has_many :schedule_responses, dependent: :destroy

  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validate :ends_at_after_starts_at

  scope :ordered, -> { order(:starts_at) }

  private

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    errors.add(:ends_at, "は開始日時より後にしてください") if ends_at <= starts_at
  end
end
