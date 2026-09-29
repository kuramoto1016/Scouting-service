class ScheduleResponse < ApplicationRecord
  belongs_to :schedule_slot
  belongs_to :intern

  ANSWERS = %w[available unavailable maybe].freeze

  validates :answer, presence: true, inclusion: { in: ANSWERS }
  validates :intern_id, uniqueness: { scope: :schedule_slot_id }
  validate :intern_must_be_participant

  private

  def intern_must_be_participant
    return if schedule_slot.blank? || intern.blank?
    return if schedule_slot.schedule.interns.exists?(id: intern_id)

    errors.add(:intern, "はこの日程調整の対象者ではありません")
  end
end
