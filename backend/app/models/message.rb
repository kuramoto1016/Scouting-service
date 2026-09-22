class Message < ApplicationRecord
  belongs_to :company
  belongs_to :intern

  SENDER_TYPES = %w[company intern].freeze

  validates :sender_type, presence: true, inclusion: { in: SENDER_TYPES }
  validates :body, presence: true

  scope :ordered, -> { order(:created_at) }
end
