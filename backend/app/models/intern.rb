class Intern < ApplicationRecord
  has_secure_password

  has_many :messages, dependent: :destroy

  EMAIL_REGEXP = /\A[^@\s]+@[^@\s]+\z/

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validate :portfolio_url_must_be_valid_http_url

  private

  def portfolio_url_must_be_valid_http_url
    return if portfolio_url.blank?

    uri = URI.parse(portfolio_url)
    unless uri.is_a?(URI::HTTP) && uri.host.present?
      errors.add(:portfolio_url, "is invalid")
    end
  rescue URI::InvalidURIError
    errors.add(:portfolio_url, "is invalid")
  end
end
