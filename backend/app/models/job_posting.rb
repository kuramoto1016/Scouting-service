class JobPosting < ApplicationRecord
  belongs_to :company
  has_many :job_applications, dependent: :destroy
  has_many :applicant_interns, through: :job_applications, source: :intern

  enum :work_style, { online: 0, onsite: 1, hybrid: 2 }, validate: { allow_nil: true }

  DEADLINE_SOON_WITHIN = 7.days

  before_validation :clear_skills_for_non_engineering_roles

  validates :title, presence: true
  validates :description, presence: true
  validates :graduation_year, numericality: { only_integer: true }, allow_nil: true
  validate :ends_on_not_before_starts_on
  validate :job_category_and_subcategory_must_be_valid_pair

  scope :with_graduation_year, ->(year) { year.blank? ? all : where(graduation_year: year) }
  scope :with_work_style, lambda { |style|
    next all if style.blank? || !work_styles.key?(style.to_s)

    where(work_style: work_styles[style.to_s])
  }
  scope :with_job_category, lambda { |category|
    next all if category.blank?

    where(job_category: category)
  }
  scope :with_job_subcategory, lambda { |subcategory|
    next all if subcategory.blank?

    where(job_subcategory: subcategory)
  }
  scope :with_location, lambda { |location|
    next all if location.blank?

    where("location LIKE ?", "%#{sanitize_sql_like(location.strip)}%")
  }
  scope :with_company, ->(company_id) { company_id.blank? ? all : where(company_id: company_id) }

  def deadline_soon?
    ends_on.present? && ends_on >= Date.current && ends_on <= DEADLINE_SOON_WITHIN.from_now.to_date
  end

  private

  def ends_on_not_before_starts_on
    return if starts_on.blank? || ends_on.blank?

    errors.add(:ends_on, "は募集開始日より前の日付にできません") if ends_on < starts_on
  end

  def job_category_and_subcategory_must_be_valid_pair
    return if job_category.blank? && job_subcategory.blank?

    unless JobTaxonomy.category_keys.include?(job_category)
      errors.add(:job_category, "が不正です")
      return
    end

    return if JobTaxonomy.valid_pair?(job_category, job_subcategory)

    errors.add(:job_subcategory, "が不正です")
  end

  def clear_skills_for_non_engineering_roles
    self.skills = [] unless job_category == "engineering"
  end
end
