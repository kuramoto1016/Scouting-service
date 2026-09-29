module Api
  module V1
    class StudentHighlightsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_intern
      before_action :authorize_self!
      before_action :set_profile
      before_action :set_highlight, only: %i[update destroy]

      def create
        highlight = @profile.student_highlights.new(highlight_params)
        if highlight.save
          render json: StudentProfileSerializer.new(@intern).as_json, status: :created
        else
          render_validation_errors(highlight.errors)
        end
      end

      def update
        if @highlight.update(highlight_params)
          render json: StudentProfileSerializer.new(@intern).as_json
        else
          render_validation_errors(@highlight.errors)
        end
      end

      def destroy
        @highlight.destroy
        render json: StudentProfileSerializer.new(@intern).as_json
      end

      # PATCH /api/v1/interns/:intern_id/student_highlights/reorder
      def reorder
        ids = Array(params[:ordered_ids]).map(&:to_i)
        ActiveRecord::Base.transaction do
          ids.each_with_index do |id, index|
            @profile.student_highlights.where(id: id).update_all(position: index + 1)
          end
        end
        render json: StudentProfileSerializer.new(@intern).as_json
      end

      private

      def set_intern
        @intern = Intern.find(params[:intern_id])
      end

      def set_profile
        @profile = @intern.student_profile || @intern.create_student_profile!
      end

      def set_highlight
        @highlight = @profile.student_highlights.find(params[:id])
      end

      def authorize_self!
        render_unauthorized unless current_account.is_a?(Intern) && current_account.id == @intern.id
      end

      def highlight_params
        params.require(:student_highlight).permit(:title, :body)
      end
    end
  end
end
