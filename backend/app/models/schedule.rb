class Schedule < ApplicationRecord
  belongs_to :company
  belongs_to :confirmed_slot, class_name: "ScheduleSlot", optional: true

  # Must run before the has_many :schedule_slots dependent: :destroy below:
  # Rails runs destroy-related callbacks in registration order, and the DB
  # foreign key on confirmed_slot_id would otherwise block deleting the slot
  # this schedule still points to.
  before_destroy :clear_confirmed_slot

  has_many :schedule_slots, dependent: :destroy
  has_many :schedule_participants, dependent: :destroy
  has_many :interns, through: :schedule_participants

  STATUSES = %w[open confirmed cancelled].freeze

  validates :title, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :must_have_at_least_one_slot, on: :create
  validate :must_have_at_least_one_participant, on: :create
  validate :confirmed_slot_must_belong_to_schedule

  scope :for_company, ->(company_id) { where(company_id: company_id) }
  scope :for_intern, lambda { |intern_id|
    joins(:schedule_participants).where(schedule_participants: { intern_id: intern_id }).distinct
  }

  def open?
    status == "open"
  end

  def confirm!(slot)
    unless open?
      errors.add(:status, "がopenの日程のみ変更できます")
      raise ActiveRecord::RecordInvalid, self
    end

    raise ArgumentError, "slot does not belong to this schedule" unless schedule_slots.exists?(id: slot.id)

    update!(status: "confirmed", confirmed_slot: slot)
  end

  private

  def must_have_at_least_one_slot
    return if schedule_slots.reject(&:marked_for_destruction?).any?

    errors.add(:base, "候補日時を1件以上登録してください")
  end

  def must_have_at_least_one_participant
    return if schedule_participants.reject(&:marked_for_destruction?).any?

    errors.add(:base, "対象の学生を1人以上選択してください")
  end

  def confirmed_slot_must_belong_to_schedule
    return if confirmed_slot_id.blank?
    return if schedule_slots.exists?(id: confirmed_slot_id)

    errors.add(:confirmed_slot, "はこの日程調整の候補ではありません")
  end

  def clear_confirmed_slot
    update_column(:confirmed_slot_id, nil) if confirmed_slot_id.present?
  end
end
