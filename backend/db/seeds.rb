# This file creates demo/dummy accounts and job postings for local development.
# It must never run against a shared or production environment, since every
# account below is created with the same well-known password.
raise "db:seed must not be run in production" if Rails.env.production?

students = [
  {
    intern: { email: "intern@example.com", name: "山田太郎" },
    profile: {
      school_type: :university,
      school_name: "青葉大学",
      department: "工学部情報工学科",
      graduation_year_month: Date.new(2028, 3, 1),
      desired_location: "関東, リモート希望",
      job_hunting_axes: "成長環境, 技術力を伸ばせる",
      bio: "Webアプリケーション開発に興味があり、個人開発でRailsとReactを使ったサービスを作っています。",
      career_goal: "将来はバックエンドを軸にしたフルスタックエンジニアとして活躍したいです。"
    },
    desired_roles: [
      { job_category: "engineering", job_subcategory: "backend", priority: 1 },
      { job_category: "engineering", job_subcategory: "fullstack", priority: 2 }
    ],
    skills: [
      { name: "Ruby", category: :language, level: :personal },
      { name: "Ruby on Rails", category: :framework, level: :personal },
      { name: "JavaScript", category: :language, level: :class_experience }
    ],
    portfolio_items: [
      {
        title: "学内サークル向け予約管理システム",
        summary: "サークル活動の部室予約を管理するWebアプリを個人で開発しました。",
        context: :personal,
        tech_stack: %w[Ruby Rails PostgreSQL],
        highlights: "予約の重複防止ロジックと通知機能の実装に工夫しました。",
        github_url: "https://github.com/example/room-booking"
      },
      {
        title: "授業課題：ECサイトのモック開発",
        summary: "授業の課題でチームによるECサイトのモックアップを開発しました。",
        context: :class_project,
        tech_stack: %w[JavaScript HTML CSS]
      }
    ]
  },
  {
    intern: { email: "student2@example.com", name: "佐藤花子" },
    profile: {
      school_type: :graduate_school,
      school_name: "みなと工科大学院",
      department: "情報科学専攻",
      graduation_year_month: Date.new(2027, 9, 1),
      desired_location: "東京都渋谷区",
      job_hunting_axes: "裁量権の大きさ, 事業の将来性",
      bio: "機械学習を使ったデータ分析に取り組んでいます。ハッカソン参加経験もあります。",
      career_goal: "データサイエンティストとして事業の意思決定に貢献したいです。"
    },
    desired_roles: [ { job_category: "engineering", job_subcategory: "data", priority: 1 } ],
    skills: [
      { name: "Python", category: :language, level: :personal },
      { name: "SQL", category: :language, level: :class_experience },
      { name: "TensorFlow", category: :framework, level: :team }
    ],
    portfolio_items: [
      {
        title: "需要予測ハッカソン優秀賞",
        summary: "3人チームで小売店の需要予測モデルを開発し、優秀賞を受賞しました。",
        context: :hackathon,
        tech_stack: %w[Python TensorFlow],
        highlights: "特徴量エンジニアリングを工夫し、精度を大きく改善しました。",
        github_url: "https://github.com/example/demand-forecast"
      },
      {
        title: "研究室のデータ可視化ツール",
        summary: "研究室内で使うデータ可視化ダッシュボードを開発しました。",
        context: :personal,
        tech_stack: %w[Python Streamlit]
      }
    ]
  },
  {
    intern: { email: "student3@example.com", name: "鈴木一郎" },
    profile: {
      school_type: :vocational_school,
      school_name: "中央ITカレッジ",
      department: "Webデザイン学科",
      graduation_year_month: Date.new(2027, 3, 1),
      desired_location: "オンライン",
      job_hunting_axes: "教育・メンター制度",
      bio: "デザインとフロントエンド実装の両方に興味があります。",
      career_goal: "UI/UXデザイナーとしてユーザー体験の改善に携わりたいです。"
    },
    desired_roles: [
      { job_category: "design", job_subcategory: "ui_ux", priority: 1 },
      { job_category: "engineering", job_subcategory: "frontend", priority: 2 }
    ],
    skills: [
      { name: "Figma", category: :tool, level: :personal },
      { name: "TypeScript", category: :language, level: :class_experience }
    ],
    portfolio_items: [
      {
        title: "カフェ予約アプリのUIデザイン",
        summary: "個人開発として、カフェの座席予約アプリのUI一式をデザインしました。",
        context: :personal,
        tech_stack: %w[Figma],
        other_url: "https://example.com/cafe-app-design"
      }
    ]
  }
].freeze

students.each do |entry|
  intern = Intern.find_or_create_by!(email: entry[:intern][:email]) do |i|
    i.name = entry[:intern][:name]
    i.password = "password123"
  end

  profile = intern.student_profile || intern.create_student_profile!
  profile.update!(entry[:profile])

  entry[:desired_roles].each do |role_attrs|
    profile.student_desired_roles.find_or_create_by!(job_subcategory: role_attrs[:job_subcategory]) do |r|
      r.job_category = role_attrs[:job_category]
      r.priority = role_attrs[:priority]
    end
  end

  entry[:skills].each do |skill_attrs|
    profile.student_skills.find_or_create_by!(name: skill_attrs[:name]) do |s|
      s.category = skill_attrs[:category]
      s.level = skill_attrs[:level]
    end
  end

  entry[:portfolio_items].each do |item_attrs|
    profile.portfolio_items.find_or_create_by!(title: item_attrs[:title]) do |item|
      item.assign_attributes(item_attrs.except(:title))
    end
  end
end

companies_and_jobs = [
  {
    company: {
      email: "recruit@sora-tech.example.com",
      name: "ソラテック株式会社",
      description: "クラウド型の物流管理SaaSを開発するスタートアップです。"
    },
    job: {
      title: "バックエンドエンジニアインターン",
      description: "Ruby on Railsを用いた物流管理SaaSのAPI開発に携わっていただきます。既存機能の改善から新機能の設計まで幅広く経験できます。",
      graduation_year: 2027,
      starts_on: Date.new(2026, 11, 1),
      ends_on: Date.new(2026, 12, 15),
      work_style: :hybrid,
      location: "東京都渋谷区",
      job_category: "engineering",
      job_subcategory: "backend",
      skills: %w[Ruby Ruby\ on\ Rails PostgreSQL]
    }
  },
  {
    company: {
      email: "hr@mizuiro-design.example.com",
      name: "ミズイロデザイン合同会社",
      description: "toB向け業務システムのUI/UXデザインを専門とする会社です。"
    },
    job: {
      title: "UI/UXデザイナーインターン",
      description: "業務システムの画面設計・プロトタイピングを担当していただきます。デザインシステムの構築にも関われます。",
      graduation_year: 2028,
      starts_on: Date.new(2026, 10, 15),
      ends_on: Date.new(2026, 10, 31),
      work_style: :online,
      location: nil,
      job_category: "design",
      job_subcategory: "ui_ux",
      skills: %w[Figma UIデザイン プロトタイピング]
    }
  },
  {
    company: {
      email: "jobs@kumo-infra.example.com",
      name: "クモインフラ株式会社",
      description: "中小企業向けにクラウドインフラの構築・運用を支援しています。"
    },
    job: {
      title: "インフラ・SREエンジニアインターン",
      description: "AWS上でのインフラ構築、監視基盤の整備、IaC化を推進するチームでの実務インターンです。",
      graduation_year: 2027,
      starts_on: Date.new(2026, 11, 10),
      ends_on: Date.new(2026, 11, 20),
      work_style: :onsite,
      location: "大阪府大阪市",
      job_category: "engineering",
      job_subcategory: "infra_sre",
      skills: %w[AWS Terraform Docker]
    }
  },
  {
    company: {
      email: "recruit@hanabi-mobile.example.com",
      name: "ハナビモバイル株式会社",
      description: "スマートフォン向けアプリを複数展開しているモバイルアプリ専業の企業です。"
    },
    job: {
      title: "モバイルアプリエンジニアインターン",
      description: "iOS/Androidアプリの新機能開発に携わっていただきます。リリースまでの一連の流れを経験できます。",
      graduation_year: 2029,
      starts_on: Date.new(2026, 12, 1),
      ends_on: Date.new(2027, 1, 10),
      work_style: :hybrid,
      location: "福岡県福岡市",
      job_category: "engineering",
      job_subcategory: "mobile",
      skills: %w[Swift Kotlin]
    }
  },
  {
    company: {
      email: "hr@aoba-data.example.com",
      name: "アオバデータラボ株式会社",
      description: "データ分析基盤の構築とデータサイエンス支援を行う会社です。"
    },
    job: {
      title: "データサイエンティストインターン",
      description: "社内データ分析基盤を用いた需要予測モデルの開発・検証を行っていただきます。",
      graduation_year: 2028,
      starts_on: Date.new(2026, 10, 20),
      ends_on: Date.new(2026, 11, 5),
      work_style: :online,
      location: nil,
      job_category: "engineering",
      job_subcategory: "data",
      skills: %w[Python SQL 機械学習]
    }
  },
  {
    company: {
      email: "recruit@nagi-frontend.example.com",
      name: "ナギフロントエンド株式会社",
      description: "ECサイト構築・運用を得意とするフロントエンド開発会社です。"
    },
    job: {
      title: "フロントエンドエンジニアインターン",
      description: "Next.jsを用いたECサイトのフロントエンド開発を担当していただきます。パフォーマンス改善にも取り組めます。",
      graduation_year: 2027,
      starts_on: Date.new(2026, 11, 1),
      ends_on: Date.new(2026, 11, 30),
      work_style: :hybrid,
      location: "東京都新宿区",
      job_category: "engineering",
      job_subcategory: "frontend",
      skills: %w[TypeScript React Next.js]
    }
  },
  {
    company: {
      email: "jobs@tsubasa-fullstack.example.com",
      name: "ツバサフルスタック株式会社",
      description: "自社プロダクトの学習管理システムを開発するEdTech企業です。"
    },
    job: {
      title: "フルスタックエンジニアインターン",
      description: "学習管理システムのフロントエンドからバックエンドまで幅広く開発に携わっていただきます。",
      graduation_year: 2029,
      starts_on: Date.new(2026, 10, 25),
      ends_on: Date.new(2026, 11, 8),
      work_style: :onsite,
      location: "愛知県名古屋市",
      job_category: "engineering",
      job_subcategory: "fullstack",
      skills: %w[TypeScript Node.js React]
    }
  },
  {
    company: {
      email: "hr@midori-qa.example.com",
      name: "ミドリ品質保証株式会社",
      description: "Webサービスの品質保証・テスト自動化を専門に行う企業です。"
    },
    job: {
      title: "QA・テストエンジニアインターン",
      description: "Webアプリケーションの自動テスト設計・実装を担当していただきます。品質保証プロセスの改善提案も歓迎します。",
      graduation_year: 2028,
      starts_on: Date.new(2026, 11, 15),
      ends_on: Date.new(2026, 12, 1),
      work_style: :online,
      location: nil,
      job_category: "engineering",
      job_subcategory: "qa",
      skills: %w[Ruby RSpec CI/CD]
    }
  }
].freeze

companies_and_jobs.each do |entry|
  company_attrs = entry[:company]
  company = Company.find_or_create_by!(email: company_attrs[:email]) do |c|
    c.name = company_attrs[:name]
    c.password = "password123"
    c.description = company_attrs[:description]
  end

  job_attrs = entry[:job]
  company.job_postings.find_or_create_by!(title: job_attrs[:title]) do |jp|
    jp.assign_attributes(job_attrs)
  end
end
