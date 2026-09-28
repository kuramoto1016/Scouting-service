class MigrateInternDataToStudentProfiles < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    Intern.reset_column_information
    StudentProfile.reset_column_information

    Intern.find_each do |intern|
      profile = StudentProfile.find_or_initialize_by(intern_id: intern.id)
      profile.assign_attributes(
        school_name: intern.university,
        department: intern.faculty,
        bio: intern.bio,
        career_goal: intern.career_goal,
        desired_location: intern.desired_location,
        job_hunting_axes: intern.job_hunting_axes
      )
      profile.save!(validate: false)

      migrate_desired_roles(profile, intern.desired_job_type)
      migrate_skills(profile, intern.skills)
      migrate_portfolio_url(profile, intern.portfolio_url)
    end
  end

  def down
    StudentDesiredRole.delete_all
    StudentSkill.delete_all
    PortfolioItem.delete_all
    StudentProfile.delete_all
  end

  private

  def migrate_desired_roles(profile, desired_job_type)
    return if desired_job_type.blank?

    roles = desired_job_type.split(",").map(&:strip).reject(&:empty?).first(StudentDesiredRole::MAX_PRIORITY)
    roles.each_with_index do |role, index|
      next if profile.student_desired_roles.exists?(role: role)

      profile.student_desired_roles.create!(role: role, priority: index + 1)
    end
  end

  def migrate_skills(profile, skills)
    return if skills.blank?

    skills.split(",").map(&:strip).reject(&:empty?).each do |name|
      next if profile.student_skills.exists?(name: name)

      profile.student_skills.create!(name: name, category: :language, level: :personal)
    end
  end

  def migrate_portfolio_url(profile, portfolio_url)
    return if portfolio_url.blank?
    return if profile.portfolio_items.exists?

    profile.portfolio_items.create!(
      title: "ポートフォリオ",
      other_url: portfolio_url,
      context: :other,
      position: 1
    )
  end
end
