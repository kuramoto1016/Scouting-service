module Api
  module V1
    class StudentProfilesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_intern
      before_action :authorize_self!
      before_action :set_profile

      SECTION_PARAMS = {
        "basic_info" => %i[school_type school_name department graduation_year_month],
        "desired_conditions" => [
          :desired_location, :job_hunting_axes, desired_roles: %i[job_category job_subcategory priority]
        ],
        "self_pr" => %i[bio career_goal]
      }.freeze

      # PATCH /api/v1/interns/:intern_id/student_profile/:section
      def update
        section = params[:section]
        return render json: { error: "不明なセクションです" }, status: :not_found unless SECTION_PARAMS.key?(section)

        case section
        when "desired_conditions"
          update_desired_conditions
        else
          update_plain_section(section)
        end
      end

      private

      def update_plain_section(section)
        permitted = section_params(section)
        if @profile.update(permitted)
          render json: StudentProfileSerializer.new(@intern).as_json
        else
          render_validation_errors(@profile.errors)
        end
      end

      def update_desired_conditions
        attrs = section_params("desired_conditions")
        roles = attrs.delete(:desired_roles) || []

        ActiveRecord::Base.transaction do
          @profile.update!(attrs.except(:desired_roles))
          @profile.student_desired_roles.destroy_all
          roles.each do |role_attrs|
            @profile.student_desired_roles.create!(
              job_category: role_attrs[:job_category],
              job_subcategory: role_attrs[:job_subcategory],
              priority: role_attrs[:priority]
            )
          end
        end
        render json: StudentProfileSerializer.new(@intern).as_json
      rescue ActiveRecord::RecordInvalid => e
        render_validation_errors(e.record.errors)
      end

      def section_params(section)
        params.require(:student_profile).permit(*SECTION_PARAMS.fetch(section))
      end

      def set_intern
        @intern = Intern.find(params[:intern_id])
      end

      def set_profile
        @profile = @intern.student_profile || @intern.create_student_profile!
      end

      def authorize_self!
        render_unauthorized unless current_account.is_a?(Intern) && current_account.id == @intern.id
      end
    end
  end
end
