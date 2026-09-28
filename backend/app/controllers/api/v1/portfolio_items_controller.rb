module Api
  module V1
    class PortfolioItemsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_intern
      before_action :authorize_self!
      before_action :set_profile
      before_action :set_portfolio_item, only: %i[update destroy]

      def create
        item = @profile.portfolio_items.new(portfolio_item_params)
        if item.save
          render json: StudentProfileSerializer.new(@intern).as_json, status: :created
        else
          render_validation_errors(item.errors)
        end
      end

      def update
        if @portfolio_item.update(portfolio_item_params)
          render json: StudentProfileSerializer.new(@intern).as_json
        else
          render_validation_errors(@portfolio_item.errors)
        end
      end

      def destroy
        @portfolio_item.destroy
        render json: StudentProfileSerializer.new(@intern).as_json
      end

      # PATCH /api/v1/interns/:intern_id/portfolio_items/reorder
      def reorder
        ids = Array(params[:ordered_ids]).map(&:to_i)
        ActiveRecord::Base.transaction do
          ids.each_with_index do |id, index|
            @profile.portfolio_items.where(id: id).update_all(position: index + 1)
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

      def set_portfolio_item
        @portfolio_item = @profile.portfolio_items.find(params[:id])
      end

      def authorize_self!
        render_unauthorized unless current_account.is_a?(Intern) && current_account.id == @intern.id
      end

      def portfolio_item_params
        params.require(:portfolio_item).permit(
          :title, :summary, :context, :highlights, :github_url, :other_url, tech_stack: []
        )
      end
    end
  end
end
