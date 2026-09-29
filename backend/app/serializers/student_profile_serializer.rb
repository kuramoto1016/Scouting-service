# Serializes an Intern together with its StudentProfile (and the profile's
# nested associations) into the JSON shape the frontend profile view expects.
class StudentProfileSerializer
  def initialize(intern)
    @intern = intern
    @profile = intern.student_profile
  end

  def as_json
    {
      id: @intern.id,
      name: @intern.name,
      email: @intern.email,
      completion_percentage: @profile&.completion_percentage || 0,
      missing_sections: @profile&.missing_sections || StudentProfile::COMPLETION_WEIGHTS.keys,
      basic_info: basic_info,
      desired_conditions: desired_conditions,
      skills: skills,
      portfolio_items: portfolio_items,
      highlights: highlights,
      self_pr: self_pr,
      links: links
    }
  end

  private

  def basic_info
    {
      school_type: @profile&.school_type,
      school_name: @profile&.school_name,
      department: @profile&.department,
      graduation_year_month: @profile&.graduation_year_month
    }
  end

  def desired_conditions
    {
      desired_roles: @profile&.student_desired_roles&.map do |r|
        {
          job_category: r.job_category,
          job_subcategory: r.job_subcategory,
          priority: r.priority
        }
      end || [],
      desired_location: @profile&.desired_location,
      job_hunting_axes: @profile&.job_hunting_axes
    }
  end

  def skills
    (@profile&.student_skills || []).map do |skill|
      { id: skill.id, name: skill.name, category: skill.category, level: skill.level }
    end
  end

  def portfolio_items
    (@profile&.portfolio_items || []).map do |item|
      {
        id: item.id,
        title: item.title,
        summary: item.summary,
        context: item.context,
        tech_stack: item.tech_stack,
        highlights: item.highlights,
        github_url: item.github_url,
        other_url: item.other_url,
        position: item.position
      }
    end
  end

  def highlights
    (@profile&.student_highlights || []).map do |highlight|
      { id: highlight.id, title: highlight.title, body: highlight.body, position: highlight.position }
    end
  end

  def self_pr
    {
      bio: @profile&.bio,
      career_goal: @profile&.career_goal
    }
  end

  def links
    (@profile&.portfolio_items || []).filter_map do |item|
      next unless item.github_url.present? || item.other_url.present?

      { portfolio_item_id: item.id, title: item.title, github_url: item.github_url, other_url: item.other_url }
    end
  end
end
