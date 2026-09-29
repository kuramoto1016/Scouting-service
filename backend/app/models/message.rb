class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender_intern, class_name: "Intern", optional: true

  SENDER_TYPES = %w[company intern].freeze

  validates :sender_type, presence: true, inclusion: { in: SENDER_TYPES }
  validates :body, presence: true
  validates :sender_intern, presence: true, if: -> { sender_type == "intern" }
  validate :sender_intern_must_be_participant

  scope :ordered, -> { order(:created_at) }

  private

  def sender_intern_must_be_participant
    return unless sender_type == "intern" && sender_intern && conversation

    return if conversation.interns.exists?(id: sender_intern_id)

    errors.add(:sender_intern, "はこの会話の参加者ではありません")
  end
end
