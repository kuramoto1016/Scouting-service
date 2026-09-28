module Api
  module V1
    class JobPostingsController < ApplicationController
      before_action :authenticate_request!, only: %i[create update destroy]
      before_action :set_job_posting, only: %i[show update destroy]
      before_action :authorize_owner!, only: %i[update destroy]

      DETAIL_FIELDS = %i[
        id title description created_at graduation_year starts_on ends_on
        work_style location job_category skills
      ].freeze

      def index
        job_postings = JobPosting.includes(:company)
                                  .with_graduation_year(params[:graduation_year])
                                  .with_work_style(params[:work_style])
                                  .with_job_category(params[:job_category])
                                  .with_location(params[:location])
                                  .order(created_at: :desc)

        render json: {
          total_count: job_postings.count,
          job_postings: serialize_many(job_postings)
        }
      end

      def show
        render json: serialize_one(@job_posting)
      end

      def create
        return render_unauthorized unless current_account.is_a?(Company)

        job_posting = current_account.job_postings.new(job_posting_params)

        if job_posting.save
          render json: serialize_one(job_posting), status: :created
        else
          render json: { errors: job_posting.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @job_posting.update(job_posting_params)
          render json: serialize_one(@job_posting)
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
        @job_posting = JobPosting.includes(:company).find(params[:id])
      end

      def authorize_owner!
        render_unauthorized unless current_account.is_a?(Company) && @job_posting.company_id == current_account.id
      end

      def job_posting_params
        params.require(:job_posting).permit(
          :title, :description, :graduation_year, :starts_on, :ends_on,
          :work_style, :location, :job_category, skills: []
        )
      end

      def serialize_many(job_postings)
        job_postings.as_json(only: DETAIL_FIELDS, include: { company: { only: %i[id name] } }).tap do |list|
          list.each_with_index { |json, i| json["deadline_soon"] = job_postings[i].deadline_soon? }
        end
      end

      def serialize_one(job_posting)
        job_posting.as_json(only: DETAIL_FIELDS, include: { company: { only: %i[id name] } })
                   .merge("deadline_soon" => job_posting.deadline_soon?)
      end
    end
  end
end
