class RecreateMessagesForConversations < ActiveRecord::Migration[8.1]
  # NOTE: This intentionally discards all existing rows in `messages` instead of
  # backfilling them into the new conversation-based schema. There is no seed data
  # for messages, and this is a local development database only, so the decision
  # was to accept the data loss rather than write a one-off backfill for it.
  def up
    drop_table :messages

    create_table :messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.string :sender_type, null: false
      t.references :sender_intern, foreign_key: { to_table: :interns }
      t.text :body, null: false

      t.timestamps
    end
  end

  def down
    drop_table :messages

    create_table :messages do |t|
      t.text "body", null: false
      t.integer "company_id", null: false
      t.integer "intern_id", null: false
      t.string "sender_type", null: false

      t.timestamps
    end

    add_index :messages, %i[company_id intern_id]
    add_index :messages, :company_id
    add_index :messages, :intern_id
    add_foreign_key :messages, :companies
    add_foreign_key :messages, :interns
  end
end
