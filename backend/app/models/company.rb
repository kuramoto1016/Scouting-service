class Company < ApplicationRecord
  has_secure_password

  has_many :messages, dependent: :destroy
  has_many :job_postings, dependent: :destroy

  EMAIL_REGEXP = /\A[^@\s]+@[^@\s]+\z/

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
end
