module Api
  module V1
    class InternRegistrationsController < ApplicationController
      def create
        intern = Intern.new(intern_params)

        if intern.save
          render json: { token: issue_token(intern), intern: serialize(intern) }, status: :created
        else
          render json: { errors: intern.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def intern_params
        params.require(:intern).permit(:name, :email, :password, :bio)
      end

      def issue_token(intern)
        JsonWebToken.encode({ sub: intern.id, sub_type: "Intern" })
      end

      def serialize(intern)
        intern.as_json(only: InternsController::PROFILE_FIELDS)
      end
    end
  end
end
