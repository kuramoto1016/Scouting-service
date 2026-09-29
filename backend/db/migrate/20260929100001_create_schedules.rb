class CreateSchedules < ActiveRecord::Migration[8.1]
  def change
    create_table :schedules do |t|
      t.references :company, null: false, foreign_key: true
      t.string :title, null: false
      t.string :status, null: false, default: "open"
      # References schedule_slots, added via a later migration once that
      # table exists (a schedule can only confirm a slot that belongs to it).
      t.bigint :confirmed_slot_id

      t.timestamps
    end

    add_index :schedules, :status
  end
end
