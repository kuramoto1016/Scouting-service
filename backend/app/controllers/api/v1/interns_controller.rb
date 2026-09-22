module Api
  module V1
    class InternsController < ApplicationController
      before_action :authenticate_request!

      def index
        interns = Intern.order(:name)
        render json: interns.as_json(only: %i[id name email bio])
      end

      def show
        intern = Intern.find(params[:id])
        render json: intern.as_json(only: %i[id name email bio])
      end
    end
  end
end
