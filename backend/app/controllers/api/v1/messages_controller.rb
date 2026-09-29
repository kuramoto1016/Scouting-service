module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_request!
      before_action :set_conversation
      before_action :authorize_participant!
      before_action :set_message, only: %i[update destroy]
      before_action :authorize_sender!, only: %i[update destroy]

      # GET /api/v1/conversations/:conversation_id/messages
      def index
        messages = @conversation.messages.includes(:sender_intern, attachments_attachments: :blob).ordered
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

      # PATCH /api/v1/conversations/:conversation_id/messages/:id (sender only)
      def update
        return render json: { error: "削除されたメッセージは編集できません" }, status: :unprocessable_entity if @message.deleted?

        # `attachments` is only replaced when the key is explicitly present in
        # the request (even as an empty array, to clear existing files);
        # omitting it entirely leaves the message's current attachments as-is.
        permitted = message_params
        new_attachments = permitted.key?(:attachments) ? permitted[:attachments] : nil
        @message.apply_edit!(body: permitted[:body].to_s, attachments: new_attachments)
        render json: message_json(@message.reload)
      rescue ActiveRecord::RecordInvalid => e
        render_validation_errors(e.record.errors)
      end

      # DELETE /api/v1/conversations/:conversation_id/messages/:id (sender only)
      def destroy
        @message.soft_delete!
        render json: message_json(@message.reload)
      end

      private

      def message_params
        params.require(:message).permit(:body, attachments: [])
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

      def set_message
        @message = @conversation.messages.find(params[:id])
      end

      def authorize_participant!
        return if current_account.is_a?(Company) && @conversation.company_id == current_account.id
        return if current_account.is_a?(Intern) && @conversation.interns.exists?(id: current_account.id)

        render_unauthorized
      end

      # Only the original sender may edit or delete a message: for a company
      # message that means the company that owns the conversation, and for an
      # intern message specifically the intern who sent it (not just any
      # participant of a group conversation).
      def authorize_sender!
        return if current_account.is_a?(Company) && @message.sender_type == "company" && @conversation.company_id == current_account.id
        return if current_account.is_a?(Intern) && @message.sender_type == "intern" && @message.sender_intern_id == current_account.id

        render_unauthorized
      end

      def message_json(message)
        {
          id: message.id,
          sender_type: message.sender_type,
          sender_intern: message.sender_intern && { id: message.sender_intern.id, name: message.sender_intern.name },
          body: message.deleted? ? "" : message.body,
          created_at: message.created_at,
          edited: message.edited?,
          deleted: message.deleted?,
          attachments: message.deleted? ? [] : message.attachments.map { |a| attachment_json(message, a) }
        }
      end

      def attachment_json(message, attachment)
        {
          id: attachment.id,
          filename: attachment.filename.to_s,
          content_type: attachment.content_type,
          byte_size: attachment.byte_size,
          url: api_v1_conversation_message_attachment_url(message.conversation_id, message.id, attachment.id)
        }
      end
    end
  end
end
