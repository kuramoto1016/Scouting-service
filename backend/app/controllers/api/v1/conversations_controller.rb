module Api
  module V1
    class ConversationsController < ApplicationController
      before_action :authenticate_request!
      before_action :set_conversation, only: %i[show update]
      before_action :authorize_participant!, only: %i[show]
      before_action :authorize_company_owner!, only: %i[update]

      # GET /api/v1/conversations
      def index
        conversations =
          if current_account.is_a?(Company)
            current_account.conversations.includes(:interns)
          elsif current_account.is_a?(Intern)
            current_account.conversations.includes(:company, :interns)
          else
            return render_unauthorized
          end

        render json: conversations.map { |c| conversation_json(c, include_company: true) }
      end

      def show
        render json: conversation_json(@conversation, include_company: true)
      end

      # POST /api/v1/conversations (company only)
      def create
        return render_unauthorized unless current_account.is_a?(Company)

        intern_ids = Array(params[:intern_ids]).map(&:to_i).uniq
        title = params[:title].presence

        if title.nil? && (existing = find_existing_untitled_conversation(intern_ids))
          return render json: conversation_json(existing, include_company: true)
        end

        conversation = current_account.conversations.new(title: title)
        intern_ids.each { |id| conversation.conversation_participants.build(intern_id: id) }

        if conversation.save
          render json: conversation_json(conversation, include_company: true), status: :created
        else
          render_validation_errors(conversation.errors)
        end
      end

      # PATCH /api/v1/conversations/:id (company only, owner)
      def update
        intern_ids = params[:intern_ids].present? ? Array(params[:intern_ids]).map(&:to_i).uniq : nil

        ActiveRecord::Base.transaction do
          @conversation.title = params[:title].presence if params.key?(:title)

          if intern_ids
            @conversation.conversation_participants.where.not(intern_id: intern_ids).destroy_all
            existing_ids = @conversation.conversation_participants.pluck(:intern_id)
            (intern_ids - existing_ids).each { |id| @conversation.conversation_participants.create!(intern_id: id) }
          end

          @conversation.save!
        end

        render json: conversation_json(@conversation.reload, include_company: true)
      rescue ActiveRecord::RecordInvalid => e
        render_validation_errors(e.record.errors)
      end

      private

      def find_existing_untitled_conversation(intern_ids)
        return nil if intern_ids.empty?

        current_account.conversations.where(title: nil).find do |conversation|
          conversation.conversation_participants.pluck(:intern_id).sort == intern_ids.sort
        end
      end

      def set_conversation
        @conversation = Conversation.includes(:company, :interns).find(params[:id])
      end

      def authorize_participant!
        return if current_account.is_a?(Company) && @conversation.company_id == current_account.id
        return if current_account.is_a?(Intern) && @conversation.interns.exists?(id: current_account.id)

        render_unauthorized
      end

      def authorize_company_owner!
        render_unauthorized unless current_account.is_a?(Company) && @conversation.company_id == current_account.id
      end

      def conversation_json(conversation, include_company: false)
        json = {
          id: conversation.id,
          title: conversation.display_title,
          interns: conversation.interns.map { |i| { id: i.id, name: i.name } }
        }
        json[:company] = { id: conversation.company.id, name: conversation.company.name } if include_company
        json
      end
    end
  end
end
