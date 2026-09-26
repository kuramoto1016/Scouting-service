require_relative "config/environment"

intern = Intern.find_or_create_by!(email: "multispace@example.com") do |i|
  i.name = "Multispace Test"
  i.password = "password12345"
end
# Multiple spaces around the comma delimiter (e.g. pasted or manually edited data)
intern.update!(skills: "Ruby,   Go")

puts "SQL: #{Intern.with_skill('Go').to_sql}"
puts "'Go' matches 'Ruby,   Go' (multi-space delimiter): #{Intern.with_skill('Go').where(id: intern.id).exists?} (expect true)"

intern.destroy
