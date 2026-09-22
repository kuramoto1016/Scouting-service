module Api
  module V1
    class JobPostingsController < ApplicationController
      before_action :authenticate_request!, only: %i[create update destroy]
      before_action :set_job_posting, only: %i[show update destroy]
      before_action :authorize_owner!, only: %i[update destroy]

      def index
        render json: JobPosting.includes(:company).order(created_at: :desc).as_json(
          only: %i[id title description created_at],
          include: { company: { only: %i[id name] } }
        )
      end

      def show
        render json: @job_posting.as_json(
          only: %i[id title description created_at],
          include: { company: { only: %i[id name] } }
        )
      end

      def create
        return render_unauthorized unless current_account.is_a?(Company)

        job_posting = current_account.job_postings.new(job_posting_params)

        if job_posting.save
          render json: job_posting.as_json(only: %i[id title description created_at]), status: :created
        else
          render json: { errors: job_posting.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @job_posting.update(job_posting_params)
          render json: @job_posting.as_json(only: %i[id title description created_at])
        else
          render json: { errors: @job_posting.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @job_posting.destroy
        head :no_content
      end

      private

      def set_job_posting
        @job_posting = JobPosting.find(params[:id])
      end

      def authorize_owner!
        render_unauthorized unless current_account.is_a?(Company) && @job_posting.company_id == current_account.id
      end

      def job_posting_params
        params.require(:job_posting).permit(:title, :description)
      end
    end
  end
end
