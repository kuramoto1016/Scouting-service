class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender_intern, class_name: "Intern", optional: true
  has_many_attached :attachments

  SENDER_TYPES = %w[company intern].freeze
  BODY_MAX_LENGTH = 3_000
  MAX_ATTACHMENTS = 5
  MAX_ATTACHMENT_SIZE = 10.megabytes
  ALLOWED_ATTACHMENT_TYPES = %w[
    image/png image/jpeg image/gif image/webp
    application/pdf
    text/plain
    application/msword
    application/vnd.openxmlformats-officedocument.wordprocessingml.document
  ].freeze

  validates :sender_type, presence: true, inclusion: { in: SENDER_TYPES }
  validates :body, presence: true, unless: -> { attachments.attached? }
  validates :body, length: { maximum: BODY_MAX_LENGTH }, allow_blank: true
  validates :sender_intern, presence: true, if: -> { sender_type == "intern" }
  validate :sender_intern_must_be_participant
  validate :attachments_within_limits

  scope :ordered, -> { order(:created_at) }

  private

  def sender_intern_must_be_participant
    return unless sender_type == "intern" && sender_intern && conversation

    return if conversation.interns.exists?(id: sender_intern_id)

    errors.add(:sender_intern, "はこの会話の参加者ではありません")
  end

  def attachments_within_limits
    return unless attachments.attached?

    if attachments.count > MAX_ATTACHMENTS
      errors.add(:attachments, "は#{MAX_ATTACHMENTS}件まで添付できます")
      return
    end

    attachments.each do |attachment|
      if attachment.byte_size > MAX_ATTACHMENT_SIZE
        errors.add(:attachments, "のファイルサイズは#{MAX_ATTACHMENT_SIZE / 1.megabyte}MBまでです")
      end

      unless ALLOWED_ATTACHMENT_TYPES.include?(attachment.content_type)
        errors.add(:attachments, "に対応していないファイル形式が含まれています")
      end
    end
  end
end
