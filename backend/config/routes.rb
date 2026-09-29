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

      resources :interns, only: %i[index show] do
        patch "student_profile/:section", to: "student_profiles#update", as: :student_profile_section
        put "student_skills", to: "student_skills#update"
        patch "portfolio_items/reorder", to: "portfolio_items#reorder"
        resources :portfolio_items, only: %i[create update destroy]
        patch "student_highlights/reorder", to: "student_highlights#reorder"
        resources :student_highlights, only: %i[create update destroy]
      end

      resources :job_postings, only: %i[index show create update destroy]

      resources :conversations, only: %i[index show create update] do
        resources :messages, only: %i[index create update destroy] do
          resources :attachments, only: %i[show], controller: :message_attachments
        end
      end

      resources :schedules, only: %i[index show create] do
        member do
          patch :confirm
          patch :cancel
        end
        patch "slots/:schedule_slot_id/response", to: "schedule_responses#update"
      end
    end
  end
end
