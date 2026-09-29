module Api
  module V1
    class SchedulesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_schedule, only: %i[show confirm cancel]
      before_action :authorize_participant!, only: %i[show]
      before_action :authorize_company_owner!, only: %i[confirm cancel]
      before_action :ensure_open_schedule!, only: %i[confirm cancel]

      # GET /api/v1/schedules
      def index
        schedules =
          if current_account.is_a?(Company)
            current_account.schedules.includes(:interns, :schedule_slots)
          elsif current_account.is_a?(Intern)
            current_account.schedules.includes(:company, :interns, :schedule_slots)
          else
            return render_unauthorized
          end

        render json: schedules.order(created_at: :desc).map { |s| schedule_json(s) }
      end

      def show
        render json: schedule_json(@schedule, include_responses: true)
      end

      # POST /api/v1/schedules (company only)
      def create
        return render_unauthorized unless current_account.is_a?(Company)

        job_posting = schedule_job_posting
        intern_ids = Array(params[:intern_ids]).map(&:to_i).uniq
        if job_posting
          return render_unauthorized unless job_posting.company_id == current_account.id

          applicant_ids = job_posting.job_applications.where(intern_id: intern_ids).pluck(:intern_id)
          if applicant_ids.sort != intern_ids.sort
            return render json: { error: "この求人にエントリーした学生のみ対象にできます" }, status: :unprocessable_entity
          end
        end

        schedule = current_account.schedules.new(title: params[:title], job_posting: job_posting)
        intern_ids.each { |id| schedule.schedule_participants.build(intern_id: id) }
        Array(params[:slots]).each do |slot|
          schedule.schedule_slots.build(starts_at: slot[:starts_at], ends_at: slot[:ends_at])
        end

        if schedule.save
          render json: schedule_json(schedule, include_responses: true), status: :created
        else
          render_validation_errors(schedule.errors)
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "指定された求人が見つかりません" }, status: :not_found
      end

      # PATCH /api/v1/schedules/:id/confirm (company only, owner)
      def confirm
        slot = @schedule.schedule_slots.find(params[:schedule_slot_id])
        @schedule.confirm!(slot)
        render json: schedule_json(@schedule.reload, include_responses: true)
      rescue ActiveRecord::RecordInvalid => e
        render_validation_errors(e.record.errors)
      rescue ActiveRecord::RecordNotFound
        render json: { error: "指定された候補日時が見つかりません" }, status: :not_found
      end

      # PATCH /api/v1/schedules/:id/cancel (company only, owner)
      def cancel
        @schedule.update!(status: "cancelled")
        render json: schedule_json(@schedule.reload, include_responses: true)
      end

      private

      def set_schedule
        @schedule = Schedule.includes(:company, :interns, schedule_slots: :schedule_responses).find(params[:id])
      end

      def authorize_participant!
        return if current_account.is_a?(Company) && @schedule.company_id == current_account.id
        return if current_account.is_a?(Intern) && @schedule.interns.exists?(id: current_account.id)

        render_unauthorized
      end

      def authorize_company_owner!
        render_unauthorized unless current_account.is_a?(Company) && @schedule.company_id == current_account.id
      end

      def schedule_job_posting
        return nil if params[:job_posting_id].blank?

        JobPosting.find(params[:job_posting_id])
      end

      def ensure_open_schedule!
        return if @schedule.open?

        render json: { error: "openの日程のみ変更できます" }, status: :unprocessable_entity
      end

      def schedule_json(schedule, include_responses: false)
        {
          id: schedule.id,
          title: schedule.title,
          status: schedule.status,
          company: { id: schedule.company.id, name: schedule.company.name },
          interns: schedule.interns.map { |i| { id: i.id, name: i.name } },
          confirmed_slot_id: schedule.confirmed_slot_id,
          slots: schedule.schedule_slots.map { |slot| slot_json(slot, include_responses: include_responses) }
        }
      end

      # Companies (who own the schedule and need to see everyone's answers)
      # get every participant's response; interns only ever get their own,
      # so one student's answer is never exposed to another student.
      def slot_json(slot, include_responses:)
        json = {
          id: slot.id,
          starts_at: slot.starts_at,
          ends_at: slot.ends_at
        }
        return json unless include_responses

        responses = slot.schedule_responses
        responses = responses.select { |r| r.intern_id == current_account.id } if current_account.is_a?(Intern)
        json[:responses] = responses.map { |r| { intern_id: r.intern_id, answer: r.answer } }
        json
      end
    end
  end
end
