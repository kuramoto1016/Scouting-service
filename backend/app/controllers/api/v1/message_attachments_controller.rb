module Api
  module V1
    class MessageAttachmentsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_conversation
      before_action :authorize_participant!
      before_action :set_message
      before_action :set_attachment

      def show
        send_data(
          @attachment.download,
          filename: @attachment.filename.to_s,
          type: @attachment.content_type,
          disposition: inline_attachment? ? "inline" : "attachment"
        )
      end

      private

      def set_conversation
        @conversation = Conversation.includes(:interns).find(params[:conversation_id])
      end

      def authorize_participant!
        return if current_account.is_a?(Company) && @conversation.company_id == current_account.id
        return if current_account.is_a?(Intern) && @conversation.interns.exists?(id: current_account.id)

        render_unauthorized
      end

      def set_message
        @message = @conversation.messages.find(params[:message_id])
      end

      def set_attachment
        @attachment = @message.attachments.attachments.find(params[:id])
      end

      def inline_attachment?
        @attachment.content_type.to_s.start_with?("image/")
      end
    end
  end
end
