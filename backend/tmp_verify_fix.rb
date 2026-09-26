require_relative "config/environment"

intern = Intern.find_or_create_by!(email: "escapetest@example.com") do |i|
  i.name = "Escape Test"
  i.password = "password12345"
end
intern.update!(skills: "C_Sharp, Ruby")

other = Intern.find_or_create_by!(email: "escapetest2@example.com") do |i|
  i.name = "Escape Test 2"
  i.password = "password12345"
end
other.update!(skills: "CXSharp")

puts "SQL: #{Intern.with_skill('C_Sharp').to_sql}"
puts "Exact match 'C_Sharp' finds intern with C_Sharp skill: #{Intern.with_skill('C_Sharp').where(id: intern.id).exists?} (expect true)"
puts "Exact match 'C_Sharp' does NOT match CXSharp intern: #{Intern.with_skill('C_Sharp').where(id: other.id).exists?} (expect false)"

# Also verify normal (no special LIKE chars) behavior still works
intern.update!(skills: "Ruby, Ruby on Rails")
puts "Ruby matches Ruby-only tag: #{Intern.with_skill('Ruby').where(id: intern.id).exists?} (expect true, since Ruby is also present)"

intern.update!(skills: "Ruby on Rails")
puts "Ruby does NOT match Ruby-on-Rails-only: #{Intern.with_skill('Ruby').where(id: intern.id).exists?} (expect false)"

intern.destroy
other.destroy
