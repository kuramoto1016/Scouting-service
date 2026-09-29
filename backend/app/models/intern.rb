class Intern < ApplicationRecord
  has_secure_password

  has_many :conversation_participants, dependent: :destroy
  has_many :conversations, through: :conversation_participants
  has_many :sent_messages, class_name: "Message", foreign_key: :sender_intern_id, dependent: :nullify, inverse_of: :sender_intern
  has_many :schedule_participants, dependent: :destroy
  has_many :schedules, through: :schedule_participants
  has_many :schedule_responses, dependent: :destroy
  has_one :student_profile, dependent: :destroy

  EMAIL_REGEXP = /\A[^@\s]+@[^@\s]+\z/

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true

  after_create :build_default_student_profile

  scope :search_keyword, lambda { |keyword|
    next all if keyword.blank?

    pattern = "%#{sanitize_sql_like(keyword)}%"
    joins(:student_profile).where(
      "interns.name LIKE :p OR student_profiles.bio LIKE :p OR student_profiles.school_name LIKE :p OR student_profiles.department LIKE :p",
      p: pattern
    )
  }

  scope :with_skill, lambda { |skill|
    next all if skill.blank?

    joins(student_profile: :student_skills).where(student_skills: { name: skill }).distinct
  }

  scope :with_job_category, lambda { |job_category|
    next all if job_category.blank?

    joins(student_profile: :student_desired_roles)
      .where(student_desired_roles: { job_category: job_category }).distinct
  }

  scope :with_job_subcategory, lambda { |job_subcategory|
    next all if job_subcategory.blank?

    joins(student_profile: :student_desired_roles)
      .where(student_desired_roles: { job_subcategory: job_subcategory }).distinct
  }

  scope :with_location, lambda { |location|
    next all if location.blank?

    joins(:student_profile).merge(StudentProfile.with_location(location))
  }

  private

  def build_default_student_profile
    create_student_profile! unless student_profile
  end
end
