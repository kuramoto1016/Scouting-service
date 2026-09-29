class CreateScheduleParticipants < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_participants do |t|
      t.references :schedule, null: false, foreign_key: true
      t.references :intern, null: false, foreign_key: true

      t.timestamps
    end

    add_index :schedule_participants, %i[schedule_id intern_id], unique: true,
              name: "index_schedule_participants_on_schedule_and_intern"
  end
end
