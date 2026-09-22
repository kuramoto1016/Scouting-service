module Api
  module V1
    class SessionsController < ApplicationController
      ACCOUNT_TYPES = {
        "intern" => Intern,
        "company" => Company
      }.freeze

      def create
        klass = ACCOUNT_TYPES[params[:account_type].to_s]
        return render json: { error: "account_type は intern または company を指定してください" }, status: :unprocessable_entity unless klass

        account = klass.find_by(email: params[:email])

        if account&.authenticate(params[:password])
          render json: {
            token: JsonWebToken.encode({ sub: account.id, sub_type: klass.name }),
            account_type: klass.name.downcase,
            account: account.as_json(except: %i[password_digest created_at updated_at])
          }, status: :ok
        else
          render json: { error: "メールアドレスまたはパスワードが正しくありません" }, status: :unauthorized
        end
      end
    end
  end
end
