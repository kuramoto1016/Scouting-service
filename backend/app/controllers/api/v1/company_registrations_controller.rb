module Api
  module V1
    class CompanyRegistrationsController < ApplicationController
      def create
        company = Company.new(company_params)

        if company.save
          render json: { token: issue_token(company), company: serialize(company) }, status: :created
        else
          render json: { errors: company.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def company_params
        params.require(:company).permit(:name, :email, :password, :description)
      end

      def issue_token(company)
        JsonWebToken.encode({ sub: company.id, sub_type: "Company" })
      end

      def serialize(company)
        company.as_json(only: %i[id name email description])
      end
    end
  end
end
