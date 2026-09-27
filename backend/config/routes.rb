Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "auth/login", to: "sessions#create"
      post "auth/intern_signup", to: "intern_registrations#create"
      post "auth/company_signup", to: "company_registrations#create"
      get "me", to: "me#show"

      resources :interns, only: %i[index show update] do
        resources :messages, only: %i[index create]
      end

      resources :companies, only: [] do
        resources :messages, only: %i[index create]
      end

      resources :job_postings, only: %i[index show create update destroy]

      get "conversations", to: "conversations#index"
    end
  end
end
