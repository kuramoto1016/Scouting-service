class JobPosting < ApplicationRecord
  belongs_to :company

  enum :work_style, { online: 0, onsite: 1, hybrid: 2 }, validate: { allow_nil: true }
  enum :job_category, {
    backend: 0,
    frontend: 1,
    mobile: 2,
    infra: 3,
    data: 4,
    design: 5
  }, validate: { allow_nil: true }

  DEADLINE_SOON_WITHIN = 7.days

  validates :title, presence: true
  validates :description, presence: true
  validates :graduation_year, numericality: { only_integer: true }, allow_nil: true
  validate :ends_on_not_before_starts_on

  scope :with_graduation_year, ->(year) { year.blank? ? all : where(graduation_year: year) }
  scope :with_work_style, lambda { |style|
    next all if style.blank? || !work_styles.key?(style.to_s)

    where(work_style: work_styles[style.to_s])
  }
  scope :with_job_category, lambda { |category|
    next all if category.blank? || !job_categories.key?(category.to_s)

    where(job_category: job_categories[category.to_s])
  }
  scope :with_location, lambda { |location|
    next all if location.blank?

    where("location LIKE ?", "%#{sanitize_sql_like(location.strip)}%")
  }

  def deadline_soon?
    ends_on.present? && ends_on >= Date.current && ends_on <= DEADLINE_SOON_WITHIN.from_now.to_date
  end

  private

  def ends_on_not_before_starts_on
    return if starts_on.blank? || ends_on.blank?

    errors.add(:ends_on, "は募集開始日より前の日付にできません") if ends_on < starts_on
  end
end
