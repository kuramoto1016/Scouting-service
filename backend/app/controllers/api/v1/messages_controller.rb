module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_conversation_partner

      # GET /api/v1/interns/:intern_id/messages (as company)
      # GET /api/v1/companies/:company_id/messages (as intern)
      def index
        messages = Message.where(company: @company, intern: @intern).ordered
        render json: messages.as_json(only: %i[id sender_type body created_at])
      end

      def create
        message = Message.new(message_params.merge(company: @company, intern: @intern, sender_type: sender_type))

        if message.save
          render json: message.as_json(only: %i[id sender_type body created_at]), status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def message_params
        params.require(:message).permit(:body)
      end

      def sender_type
        current_account_type.downcase
      end

      def set_conversation_partner
        if current_account.is_a?(Company)
          @company = current_account
          @intern = Intern.find(params[:intern_id])
        elsif current_account.is_a?(Intern)
          @intern = current_account
          @company = Company.find(params[:company_id])
        else
          render_unauthorized
        end
      end
    end
  end
end
