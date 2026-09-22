class JobPosting < ApplicationRecord
  belongs_to :company

  validates :title, presence: true
  validates :description, presence: true
end
