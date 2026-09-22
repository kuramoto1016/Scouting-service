class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  def authenticate_request!
    payload = decoded_token
    return render_unauthorized unless payload

    @current_account = find_account(payload["sub_type"], payload["sub"])
    render_unauthorized unless @current_account
  end

  def current_account
    @current_account
  end

  def current_account_type
    current_account&.class&.name
  end

  private

  def decoded_token
    header = request.headers["Authorization"]
    return nil unless header

    token = header.split(" ").last
    JsonWebToken.decode(token)
  end

  def find_account(type, id)
    return nil unless %w[Company Intern].include?(type)

    type.constantize.find_by(id: id)
  end

  def render_unauthorized
    render json: { error: "認証が必要です" }, status: :unauthorized
  end

  def render_not_found
    render json: { error: "リソースが見つかりません" }, status: :not_found
  end
end
