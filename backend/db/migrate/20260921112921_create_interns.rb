class CreateInterns < ActiveRecord::Migration[8.1]
  def change
    create_table :interns do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.text :bio

      t.timestamps
    end
    add_index :interns, :email, unique: true
  end
end
