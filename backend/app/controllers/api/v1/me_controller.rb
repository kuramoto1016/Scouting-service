module Api
  module V1
    class MeController < ApplicationController
      before_action :authenticate_request!

      def show
        render json: {
          account_type: current_account_type.downcase,
          account: current_account.as_json(except: %i[password_digest created_at updated_at])
        }
      end
    end
  end
end
