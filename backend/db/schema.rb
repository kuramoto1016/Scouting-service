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

ActiveRecord::Schema[8.1].define(version: 2026_09_29_100004) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "companies", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_companies_on_email", unique: true
  end

  create_table "conversation_participants", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.bigint "intern_id", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id", "intern_id"], name: "index_participants_on_conversation_and_intern", unique: true
    t.index ["conversation_id"], name: "index_conversation_participants_on_conversation_id"
    t.index ["intern_id"], name: "index_conversation_participants_on_intern_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_conversations_on_company_id"
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
    t.string "job_category"
    t.string "job_subcategory"
    t.string "location"
    t.string "skills", default: [], null: false, array: true
    t.date "starts_on"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "work_style"
    t.index ["company_id"], name: "index_job_postings_on_company_id"
    t.index ["graduation_year"], name: "index_job_postings_on_graduation_year"
    t.index ["job_category"], name: "index_job_postings_on_job_category"
    t.index ["job_subcategory"], name: "index_job_postings_on_job_subcategory"
    t.index ["skills"], name: "index_job_postings_on_skills", using: :gin
    t.index ["work_style"], name: "index_job_postings_on_work_style"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.bigint "sender_intern_id"
    t.string "sender_type", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["sender_intern_id"], name: "index_messages_on_sender_intern_id"
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

  create_table "schedule_participants", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "intern_id", null: false
    t.bigint "schedule_id", null: false
    t.datetime "updated_at", null: false
    t.index ["intern_id"], name: "index_schedule_participants_on_intern_id"
    t.index ["schedule_id", "intern_id"], name: "index_schedule_participants_on_schedule_and_intern", unique: true
    t.index ["schedule_id"], name: "index_schedule_participants_on_schedule_id"
  end

  create_table "schedule_responses", force: :cascade do |t|
    t.string "answer", null: false
    t.datetime "created_at", null: false
    t.bigint "intern_id", null: false
    t.bigint "schedule_slot_id", null: false
    t.datetime "updated_at", null: false
    t.index ["intern_id"], name: "index_schedule_responses_on_intern_id"
    t.index ["schedule_slot_id", "intern_id"], name: "index_schedule_responses_on_slot_and_intern", unique: true
    t.index ["schedule_slot_id"], name: "index_schedule_responses_on_schedule_slot_id"
  end

  create_table "schedule_slots", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "ends_at", null: false
    t.bigint "schedule_id", null: false
    t.datetime "starts_at", null: false
    t.datetime "updated_at", null: false
    t.index ["schedule_id"], name: "index_schedule_slots_on_schedule_id"
  end

  create_table "schedules", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.bigint "confirmed_slot_id"
    t.datetime "created_at", null: false
    t.string "status", default: "open", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_schedules_on_company_id"
    t.index ["confirmed_slot_id"], name: "index_schedules_on_confirmed_slot_id"
    t.index ["status"], name: "index_schedules_on_status"
  end

  create_table "student_desired_roles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "job_category", null: false
    t.string "job_subcategory", null: false
    t.integer "priority", null: false
    t.bigint "student_profile_id", null: false
    t.datetime "updated_at", null: false
    t.index ["student_profile_id", "job_subcategory"], name: "index_desired_roles_on_profile_and_subcategory", unique: true
    t.index ["student_profile_id", "priority"], name: "index_desired_roles_on_profile_and_priority", unique: true
    t.index ["student_profile_id"], name: "index_student_desired_roles_on_student_profile_id"
  end

  create_table "student_highlights", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.integer "position", default: 0, null: false
    t.bigint "student_profile_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["student_profile_id", "position"], name: "index_student_highlights_on_student_profile_id_and_position"
    t.index ["student_profile_id"], name: "index_student_highlights_on_student_profile_id"
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "conversation_participants", "conversations"
  add_foreign_key "conversation_participants", "interns"
  add_foreign_key "conversations", "companies"
  add_foreign_key "job_postings", "companies"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "interns", column: "sender_intern_id"
  add_foreign_key "portfolio_items", "student_profiles"
  add_foreign_key "schedule_participants", "interns"
  add_foreign_key "schedule_participants", "schedules"
  add_foreign_key "schedule_responses", "interns"
  add_foreign_key "schedule_responses", "schedule_slots"
  add_foreign_key "schedule_slots", "schedules"
  add_foreign_key "schedules", "companies"
  add_foreign_key "schedules", "schedule_slots", column: "confirmed_slot_id"
  add_foreign_key "student_desired_roles", "student_profiles"
  add_foreign_key "student_highlights", "student_profiles"
  add_foreign_key "student_profiles", "interns"
  add_foreign_key "student_skills", "student_profiles"
end
