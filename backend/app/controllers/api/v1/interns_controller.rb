module Api
  module V1
    class InternsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_intern, only: %i[show update]
      before_action :authorize_self!, only: %i[update]

      PROFILE_FIELDS = %i[id name email bio university faculty grade skills desired_location desired_job_type].freeze

      def index
        interns = Intern.order(:name)
        render json: interns.as_json(only: PROFILE_FIELDS)
      end

      def show
        render json: @intern.as_json(only: PROFILE_FIELDS)
      end

      def update
        if @intern.update(intern_params)
          render json: @intern.as_json(only: PROFILE_FIELDS)
        else
          render json: { errors: @intern.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_intern
        @intern = Intern.find(params[:id])
      end

      def authorize_self!
        render_unauthorized unless current_account.is_a?(Intern) && current_account.id == @intern.id
      end

      def intern_params
        params.require(:intern).permit(
          :name, :bio, :university, :faculty, :grade, :skills, :desired_location, :desired_job_type
        )
      end
    end
  end
end
