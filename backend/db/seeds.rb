# This file creates demo/dummy accounts and job postings for local development.
# It must never run against a shared or production environment, since every
# account below is created with the same well-known password.
raise "db:seed must not be run in production" if Rails.env.production?

intern = Intern.find_or_create_by!(email: "intern@example.com") do |i|
  i.name = "山田太郎"
  i.password = "password123"
  i.bio = "Webアプリケーション開発に興味があるインターン生です。"
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
      job_category: :backend,
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
      job_category: :design,
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
      job_category: :infra,
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
      job_category: :mobile,
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
      job_category: :data,
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
      job_category: :frontend,
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
      job_category: :backend,
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
      job_category: :infra,
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
