class CreateConversationParticipants < ActiveRecord::Migration[8.1]
  def change
    create_table :conversation_participants do |t|
      t.references :conversation, null: false, foreign_key: true
      t.references :intern, null: false, foreign_key: true

      t.timestamps
    end

    add_index :conversation_participants, %i[conversation_id intern_id], unique: true, name: "index_participants_on_conversation_and_intern"
  end
end
