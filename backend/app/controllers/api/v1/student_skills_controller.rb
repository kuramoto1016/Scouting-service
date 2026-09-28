module Api
  module V1
    class StudentSkillsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_intern
      before_action :authorize_self!
      before_action :set_profile

      # PUT /api/v1/interns/:intern_id/student_skills
      # Replaces the full skill list in one request (the skills section is
      # edited as a whole set, not one skill at a time).
      def update
        skills_attrs = params.require(:skills).map { |s| s.permit(:name, :category, :level) }

        ActiveRecord::Base.transaction do
          @profile.student_skills.destroy_all
          skills_attrs.each { |attrs| @profile.student_skills.create!(attrs) }
        end
        render json: StudentProfileSerializer.new(@intern).as_json
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

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
