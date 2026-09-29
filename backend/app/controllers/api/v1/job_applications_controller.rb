module Api
  module V1
    class JobApplicationsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_job_posting

      def index
        return render_unauthorized unless current_account.is_a?(Company) && @job_posting.company_id == current_account.id

        interns = @job_posting.applicant_interns.includes(
          student_profile: %i[student_desired_roles student_skills portfolio_items student_highlights]
        ).order(:name)
        render json: interns.map { |intern| StudentProfileSerializer.new(intern).as_json }
      end

      def create
        return render_unauthorized unless current_account.is_a?(Intern)

        application = @job_posting.job_applications.find_or_initialize_by(intern: current_account)

        if application.save
          render json: application_json(application), status: application.previously_new_record? ? :created : :ok
        else
          render_validation_errors(application.errors)
        end
      end

      private

      def set_job_posting
        @job_posting = JobPosting.find(params[:job_posting_id])
      end

      def application_json(application)
        {
          id: application.id,
          job_posting_id: application.job_posting_id,
          intern_id: application.intern_id,
          created_at: application.created_at
        }
      end
    end
  end
end
