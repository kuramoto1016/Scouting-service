class Intern < ApplicationRecord
  has_secure_password

  has_many :messages, dependent: :destroy

  EMAIL_REGEXP = /\A[^@\s]+@[^@\s]+\z/

  PORTFOLIO_URL_REGEXP = %r{\Ahttps?://}

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validates :portfolio_url, format: { with: PORTFOLIO_URL_REGEXP }, allow_blank: true
end
