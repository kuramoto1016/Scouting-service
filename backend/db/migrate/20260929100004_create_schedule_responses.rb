class CreateScheduleResponses < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_responses do |t|
      t.references :schedule_slot, null: false, foreign_key: true
      t.references :intern, null: false, foreign_key: true
      t.string :answer, null: false

      t.timestamps
    end

    add_index :schedule_responses, %i[schedule_slot_id intern_id], unique: true,
              name: "index_schedule_responses_on_slot_and_intern"
  end
end
