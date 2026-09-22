class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.references :company, null: false, foreign_key: true
      t.references :intern, null: false, foreign_key: true
      t.string :sender_type, null: false
      t.text :body, null: false

      t.timestamps
    end
    add_index :messages, [ :company_id, :intern_id ]
  end
end
