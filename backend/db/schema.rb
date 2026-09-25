# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_25_063231) do
  create_table "companies", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_companies_on_email", unique: true
  end

  create_table "interns", force: :cascade do |t|
    t.text "bio"
    t.text "career_goal"
    t.datetime "created_at", null: false
    t.string "desired_job_type"
    t.string "desired_location"
    t.string "email", null: false
    t.string "faculty"
    t.string "grade"
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "portfolio_url"
    t.string "skills"
    t.string "university"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_interns_on_email", unique: true
  end

  create_table "job_postings", force: :cascade do |t|
    t.integer "company_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_job_postings_on_company_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.integer "company_id", null: false
    t.datetime "created_at", null: false
    t.integer "intern_id", null: false
    t.string "sender_type", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "intern_id"], name: "index_messages_on_company_id_and_intern_id"
    t.index ["company_id"], name: "index_messages_on_company_id"
    t.index ["intern_id"], name: "index_messages_on_intern_id"
  end

  add_foreign_key "job_postings", "companies"
  add_foreign_key "messages", "companies"
  add_foreign_key "messages", "interns"
end
