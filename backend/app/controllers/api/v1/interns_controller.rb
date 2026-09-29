module Api
  module V1
    class InternsController < ApplicationController
      before_action :authenticate_request!
      before_action :authorize_company!, only: %i[index show]
      before_action :set_intern, only: %i[show]

      def index
        interns = Intern.includes(student_profile: %i[student_desired_roles student_skills portfolio_items student_highlights])
                         .search_keyword(params[:keyword])
                         .with_skill(params[:skill])
                         .with_job_subcategory(params[:job_subcategory])
                         .with_location(params[:location])
                         .order(:name)
        render json: interns.map { |intern| StudentProfileSerializer.new(intern).as_json }
      end

      def show
        render json: StudentProfileSerializer.new(@intern).as_json
      end

      private

      def set_intern
        @intern = Intern.includes(student_profile: %i[student_desired_roles student_skills portfolio_items student_highlights])
                         .find(params[:id])
      end

      def authorize_company!
        render_unauthorized unless current_account.is_a?(Company)
      end
    end
  end
end
