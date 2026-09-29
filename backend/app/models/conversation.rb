class Conversation < ApplicationRecord
  belongs_to :company
  has_many :conversation_participants, dependent: :destroy
  has_many :interns, through: :conversation_participants
  has_many :messages, dependent: :destroy

  validates :company, presence: true
  validate :must_have_at_least_one_participant

  def display_title
    title.presence || interns.order(:id).map { |intern| "#{intern.name}さん" }.join("、")
  end

  private

  def must_have_at_least_one_participant
    return if conversation_participants.reject(&:marked_for_destruction?).any?

    errors.add(:base, "参加者を1人以上選択してください")
  end
end
