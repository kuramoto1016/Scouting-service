class ConversationParticipant < ApplicationRecord
  belongs_to :conversation
  belongs_to :intern

  validates :intern_id, uniqueness: { scope: :conversation_id }
end
