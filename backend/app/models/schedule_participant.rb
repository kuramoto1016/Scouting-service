class ScheduleParticipant < ApplicationRecord
  belongs_to :schedule
  belongs_to :intern

  validates :intern_id, uniqueness: { scope: :schedule_id }
end
