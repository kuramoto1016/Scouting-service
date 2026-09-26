class Intern < ApplicationRecord
  has_secure_password

  has_many :messages, dependent: :destroy

  EMAIL_REGEXP = /\A[^@\s]+@[^@\s]+\z/

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validate :portfolio_url_must_be_valid_http_url

  scope :search_keyword, lambda { |keyword|
    next all if keyword.blank?

    pattern = "%#{sanitize_sql_like(keyword)}%"
    where(
      "name LIKE :p OR bio LIKE :p OR university LIKE :p OR faculty LIKE :p",
      p: pattern
    )
  }

  scope :with_skill, lambda { |skill|
    next all if skill.blank?

    where_tag_match(:skills, skill)
  }

  scope :with_job_type, lambda { |job_type|
    next all if job_type.blank?

    where_tag_match(:desired_job_type, job_type)
  }

  scope :with_location, lambda { |location|
    next all if location.blank?

    where_tag_match(:desired_location, location)
  }

  # Matches a comma-separated tag column (e.g. "Ruby, Ruby on Rails") against a
  # complete tag rather than a substring, so "Ruby" doesn't also match
  # "Ruby on Rails". Only whitespace immediately adjacent to the comma
  # delimiter is normalized; spaces inside a tag (e.g. "C ++") are preserved
  # so it stays distinct from "C++".
  def self.where_tag_match(column, value)
    escaped = sanitize_sql_like(value.strip)
    normalized_column = "REPLACE(REPLACE(#{column}, ', ', ','), ' ,', ',')"
    where(
      "(',' || #{normalized_column} || ',') LIKE ? ESCAPE '\\'",
      "%,#{escaped},%"
    )
  end

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
