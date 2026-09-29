class CreateScheduleSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_slots do |t|
      t.references :schedule, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false

      t.timestamps
    end

    add_foreign_key :schedules, :schedule_slots, column: :confirmed_slot_id
    add_index :schedules, :confirmed_slot_id
  end
end
