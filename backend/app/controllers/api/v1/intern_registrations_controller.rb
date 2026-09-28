module Api
  module V1
    class InternRegistrationsController < ApplicationController
      def create
        intern = Intern.new(intern_params)

        if intern.save
          intern.student_profile.update!(bio: params.dig(:intern, :bio)) if params.dig(:intern, :bio).present?
          render json: { token: issue_token(intern), intern: StudentProfileSerializer.new(intern).as_json }, status: :created
        else
          render json: { errors: intern.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def intern_params
        params.require(:intern).permit(:name, :email, :password)
      end

      def issue_token(intern)
        JsonWebToken.encode({ sub: intern.id, sub_type: "Intern" })
      end
    end
  end
end
