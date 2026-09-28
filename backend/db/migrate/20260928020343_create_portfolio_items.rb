class CreatePortfolioItems < ActiveRecord::Migration[8.1]
  def change
    create_table :portfolio_items do |t|
      t.references :student_profile, null: false, foreign_key: true
      t.string :title, null: false
      t.text :summary
      t.integer :context
      t.string :tech_stack, array: true, default: [], null: false
      t.text :highlights
      t.string :github_url
      t.string :other_url
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :portfolio_items, [ :student_profile_id, :position ]
  end
end
