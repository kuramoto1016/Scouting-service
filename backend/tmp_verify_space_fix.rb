require_relative "config/environment"

intern_with_space = Intern.find_or_create_by!(email: "spacecheck1@example.com") do |i|
  i.name = "Space Check 1"
  i.password = "password12345"
end
intern_with_space.update!(skills: "C ++, Ruby")

intern_no_space = Intern.find_or_create_by!(email: "spacecheck2@example.com") do |i|
  i.name = "Space Check 2"
  i.password = "password12345"
end
intern_no_space.update!(skills: "C++, Ruby")

puts "SQL for 'C ++': #{Intern.with_skill('C ++').to_sql}"
puts "'C ++' matches 'C ++' tag: #{Intern.with_skill('C ++').where(id: intern_with_space.id).exists?} (expect true)"
puts "'C ++' does NOT match 'C++' tag: #{Intern.with_skill('C ++').where(id: intern_no_space.id).exists?} (expect false)"
puts "'C++' matches 'C++' tag: #{Intern.with_skill('C++').where(id: intern_no_space.id).exists?} (expect true)"
puts "'C++' does NOT match 'C ++' tag: #{Intern.with_skill('C++').where(id: intern_with_space.id).exists?} (expect false)"

# Regression: comma+space normalization and "Ruby" vs "Ruby on Rails" still work
intern_with_space.update!(skills: "Ruby on Rails, Python")
puts "Ruby does NOT match Ruby-on-Rails-only: #{Intern.with_skill('Ruby').where(id: intern_with_space.id).exists?} (expect false)"
intern_with_space.update!(skills: "Ruby, Go")
puts "Ruby matches when Ruby is a standalone tag: #{Intern.with_skill('Ruby').where(id: intern_with_space.id).exists?} (expect true)"

# Underscore escape regression
intern_with_space.update!(skills: "C_Sharp")
puts "C_Sharp exact match still works: #{Intern.with_skill('C_Sharp').where(id: intern_with_space.id).exists?} (expect true)"

intern_with_space.destroy
intern_no_space.destroy
