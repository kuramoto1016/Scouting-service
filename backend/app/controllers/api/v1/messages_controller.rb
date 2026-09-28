module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_conversation
      before_action :authorize_participant!

      # GET /api/v1/conversations/:conversation_id/messages
      def index
        messages = @conversation.messages.includes(:sender_intern).ordered
        render json: messages.map { |m| message_json(m) }
      end

      # POST /api/v1/conversations/:conversation_id/messages
      def create
        message = @conversation.messages.new(message_params.merge(sender_type: sender_type, sender_intern: sender_intern))

        if message.save
          render json: message_json(message), status: :created
        else
          render_validation_errors(message.errors)
        end
      end

      private

      def message_params
        params.require(:message).permit(:body)
      end

      def sender_type
        current_account_type.downcase
      end

      def sender_intern
        current_account.is_a?(Intern) ? current_account : nil
      end

      def set_conversation
        @conversation = Conversation.includes(:interns).find(params[:conversation_id])
      end

      def authorize_participant!
        return if current_account.is_a?(Company) && @conversation.company_id == current_account.id
        return if current_account.is_a?(Intern) && @conversation.interns.exists?(id: current_account.id)

        render_unauthorized
      end

      def message_json(message)
        {
          id: message.id,
          sender_type: message.sender_type,
          sender_intern: message.sender_intern && { id: message.sender_intern.id, name: message.sender_intern.name },
          body: message.body,
          created_at: message.created_at
        }
      end
    end
  end
end
