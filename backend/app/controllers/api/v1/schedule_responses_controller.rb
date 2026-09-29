module Api
  module V1
    class ScheduleResponsesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_schedule_slot
      before_action :authorize_participant!

      # PUT /api/v1/schedules/:schedule_id/slots/:schedule_slot_id/response (intern only)
      def update
        return render_unauthorized unless current_account.is_a?(Intern)

        response = ScheduleResponse.find_or_initialize_by(schedule_slot: @schedule_slot, intern: current_account)
        response.answer = params[:answer]

        if response.save
          render json: { intern_id: response.intern_id, answer: response.answer }
        else
          render_validation_errors(response.errors)
        end
      end

      private

      def set_schedule_slot
        @schedule = Schedule.includes(:interns).find(params[:schedule_id])
        @schedule_slot = @schedule.schedule_slots.find(params[:schedule_slot_id])
      end

      def authorize_participant!
        return if current_account.is_a?(Intern) && @schedule.interns.exists?(id: current_account.id)

        render_unauthorized
      end
    end
  end
end
