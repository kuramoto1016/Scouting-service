module Api
  module V1
    class MeController < ApplicationController
      before_action :authenticate_request!

      def show
        render json: {
          account_type: current_account_type.downcase,
          account: serialize(current_account)
        }
      end

      private

      def serialize(account)
        if account.is_a?(Intern)
          intern = Intern.includes(student_profile: %i[student_desired_roles student_skills portfolio_items student_highlights])
                          .find(account.id)
          StudentProfileSerializer.new(intern).as_json
        else
          account.as_json(except: %i[password_digest created_at updated_at])
        end
      end
    end
  end
end
