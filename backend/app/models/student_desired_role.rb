class StudentDesiredRole < ApplicationRecord
  belongs_to :student_profile

  MAX_PRIORITY = 3

  validates :job_category, presence: true, inclusion: { in: JobTaxonomy.category_keys }
  validates :job_subcategory, presence: true, uniqueness: { scope: :student_profile_id }
  validates :priority,
            presence: true,
            uniqueness: { scope: :student_profile_id },
            inclusion: { in: 1..MAX_PRIORITY }
  validate :job_subcategory_must_belong_to_category

  private

  def job_subcategory_must_belong_to_category
    return if job_category.blank? || job_subcategory.blank?
    return if JobTaxonomy.valid_pair?(job_category, job_subcategory)

    errors.add(:job_subcategory, "が不正です")
  end
end
