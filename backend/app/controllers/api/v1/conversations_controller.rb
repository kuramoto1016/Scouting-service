module Api
  module V1
    class ConversationsController < ApplicationController
      before_action :authenticate_request!

      # GET /api/v1/conversations
      # Returns the list of conversation partners for the current account.
      def index
        if current_account.is_a?(Company)
          render json: company_conversations
        elsif current_account.is_a?(Intern)
          render json: intern_conversations
        else
          render_unauthorized
        end
      end

      private

      def company_conversations
        Intern.joins(:messages).where(messages: { company_id: current_account.id }).distinct
              .as_json(only: %i[id name email bio])
      end

      def intern_conversations
        Company.joins(:messages).where(messages: { intern_id: current_account.id }).distinct
               .as_json(only: %i[id name email description])
      end
    end
  end
end
