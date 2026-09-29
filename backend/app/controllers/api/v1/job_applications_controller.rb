module Api
  module V1
    class JobApplicationsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_job_posting, only: %i[index create]

      def mine
        return render_unauthorized unless current_account.is_a?(Intern)

        job_postings = current_account.applied_job_postings
                                      .includes(:company)
                                      .order("job_applications.created_at DESC")
        total_count = job_postings.count
        job_postings = job_postings.limit(result_limit) if result_limit

        render json: {
          total_count: total_count,
          job_postings: serialize_job_postings(job_postings)
        }
      end

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
        already_applied = application.persisted?

        if application.save
          render json: application_json(application).merge(already_applied: already_applied),
                 status: already_applied ? :ok : :created
        else
          render_validation_errors(application.errors)
        end
      end

      private

      def set_job_posting
        @job_posting = JobPosting.find(params[:job_posting_id])
      end

      def result_limit
        return nil if params[:limit].blank?

        limit = params[:limit].to_i
        limit.positive? ? limit : nil
      end

      def serialize_job_postings(job_postings)
        job_postings.as_json(
          only: JobPostingsController::DETAIL_FIELDS,
          include: { company: { only: %i[id name] } }
        ).tap do |list|
          list.each_with_index { |json, i| json["deadline_soon"] = job_postings[i].deadline_soon? }
        end
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
