# This file should ensure the existence of records required to run the application in every environment.

intern = Intern.find_or_create_by!(email: "intern@example.com") do |i|
  i.name = "山田太郎"
  i.password = "password123"
  i.bio = "Webアプリケーション開発に興味があるインターン生です。"
end

company = Company.find_or_create_by!(email: "company@example.com") do |c|
  c.name = "ダミー株式会社"
  c.password = "password123"
  c.description = "ソフトウェア開発を行う会社です。"
end

company.job_postings.find_or_create_by!(title: "バックエンドエンジニアインターン") do |jp|
  jp.description = "Railsを使ったAPI開発のインターンです。"
end
