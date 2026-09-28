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

ActiveRecord::Schema[8.1].define(version: 2026_09_28_021724) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_interns_on_email", unique: true
  end

  create_table "job_postings", force: :cascade do |t|
    t.integer "company_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.date "ends_on"
    t.integer "graduation_year"
    t.integer "job_category"
    t.string "location"
    t.string "skills", default: [], null: false, array: true
    t.date "starts_on"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "work_style"
    t.index ["company_id"], name: "index_job_postings_on_company_id"
    t.index ["graduation_year"], name: "index_job_postings_on_graduation_year"
    t.index ["job_category"], name: "index_job_postings_on_job_category"
    t.index ["skills"], name: "index_job_postings_on_skills", using: :gin
    t.index ["work_style"], name: "index_job_postings_on_work_style"
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

  create_table "portfolio_items", force: :cascade do |t|
    t.integer "context"
    t.datetime "created_at", null: false
    t.string "github_url"
    t.text "highlights"
    t.string "other_url"
    t.integer "position", default: 0, null: false
    t.bigint "student_profile_id", null: false
    t.text "summary"
    t.string "tech_stack", default: [], null: false, array: true
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["student_profile_id", "position"], name: "index_portfolio_items_on_student_profile_id_and_position"
    t.index ["student_profile_id"], name: "index_portfolio_items_on_student_profile_id"
  end

  create_table "student_desired_roles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "priority", null: false
    t.string "role", null: false
    t.bigint "student_profile_id", null: false
    t.datetime "updated_at", null: false
    t.index ["student_profile_id", "priority"], name: "index_desired_roles_on_profile_and_priority", unique: true
    t.index ["student_profile_id", "role"], name: "index_desired_roles_on_profile_and_role", unique: true
    t.index ["student_profile_id"], name: "index_student_desired_roles_on_student_profile_id"
  end

  create_table "student_profiles", force: :cascade do |t|
    t.text "bio"
    t.text "career_goal"
    t.datetime "created_at", null: false
    t.string "department"
    t.string "desired_location"
    t.date "graduation_year_month"
    t.bigint "intern_id", null: false
    t.string "job_hunting_axes"
    t.string "school_name"
    t.integer "school_type"
    t.datetime "updated_at", null: false
    t.index ["intern_id"], name: "index_student_profiles_on_intern_id", unique: true
  end

  create_table "student_skills", force: :cascade do |t|
    t.integer "category", null: false
    t.datetime "created_at", null: false
    t.integer "level", null: false
    t.string "name", null: false
    t.bigint "student_profile_id", null: false
    t.datetime "updated_at", null: false
    t.index ["student_profile_id", "name"], name: "index_student_skills_on_student_profile_id_and_name", unique: true
    t.index ["student_profile_id"], name: "index_student_skills_on_student_profile_id"
  end

  add_foreign_key "job_postings", "companies"
  add_foreign_key "messages", "companies"
  add_foreign_key "messages", "interns"
  add_foreign_key "portfolio_items", "student_profiles"
  add_foreign_key "student_desired_roles", "student_profiles"
  add_foreign_key "student_profiles", "interns"
  add_foreign_key "student_skills", "student_profiles"
end
