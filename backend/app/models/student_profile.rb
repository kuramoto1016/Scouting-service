class StudentProfile < ApplicationRecord
  belongs_to :intern
  has_many :student_desired_roles, -> { order(:priority) }, dependent: :destroy
  has_many :student_skills, dependent: :destroy
  has_many :portfolio_items, -> { order(:position) }, dependent: :destroy

  enum :school_type, {
    university: 0,
    graduate_school: 1,
    vocational_school: 2,
    technical_college: 3,
    other: 4
  }, validate: { allow_nil: true }

  TAG_COLUMNS = %i[desired_location job_hunting_axes].freeze

  before_validation :normalize_tag_columns

  # Completion weights must sum to 100. Each represents one profile section;
  # a section counts as complete only if `complete?` below says so.
  COMPLETION_WEIGHTS = {
    basic_info: 20,
    desired_conditions: 20,
    skills: 20,
    portfolio_items: 20,
    self_pr: 10,
    links: 10
  }.freeze

  scope :with_location, lambda { |location|
    next all if location.blank?

    where_tag_match(:desired_location, location)
  }

  def self.normalize_tag_value(value)
    value.to_s.strip
  end

  def self.normalize_tag_list(value)
    value.to_s.split(",").map { |tag| normalize_tag_value(tag) }.reject(&:empty?).join(", ")
  end

  # Matches a comma-separated tag column (e.g. "東京, リモート希望") against a
  # complete tag rather than a substring, so a search for "東京" doesn't also
  # match "東京以外". Relies on tag columns always being stored in normalized
  # "tag, tag" form (see #normalize_tag_columns).
  def self.where_tag_match(column, value)
    escaped = sanitize_sql_like(normalize_tag_value(value))
    where(
      "(',' || REPLACE(#{column}, ', ', ',') || ',') LIKE ? ESCAPE '\\'",
      "%,#{escaped},%"
    )
  end

  def completion_percentage
    COMPLETION_WEIGHTS.sum { |section, weight| section_complete?(section) ? weight : 0 }
  end

  def missing_sections
    COMPLETION_WEIGHTS.keys.reject { |section| section_complete?(section) }
  end

  private

  def section_complete?(section)
    case section
    when :basic_info
      school_name.present? && department.present? && graduation_year_month.present?
    when :desired_conditions
      student_desired_roles.any? && desired_location.present?
    when :skills
      student_skills.any?
    when :portfolio_items
      portfolio_items.any?
    when :self_pr
      bio.present? && career_goal.present?
    when :links
      portfolio_items.any? { |item| item.github_url.present? || item.other_url.present? }
    else
      false
    end
  end

  def normalize_tag_columns
    TAG_COLUMNS.each do |column|
      value = read_attribute(column)
      next if value.nil?

      write_attribute(column, self.class.normalize_tag_list(value))
    end
  end
end
