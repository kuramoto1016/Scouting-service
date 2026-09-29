class JobApplication < ApplicationRecord
  belongs_to :job_posting
  belongs_to :intern

  validates :intern_id, uniqueness: { scope: :job_posting_id }
end
