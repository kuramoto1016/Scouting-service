require_relative "config/environment"

# Two interns: one has "C ++" (with a space), the other has "C++" (no space).
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
puts "Search 'C ++' matches 'C ++' tag: #{Intern.with_skill('C ++').where(id: intern_with_space.id).exists?} (expect true)"
puts "Search 'C ++' incorrectly ALSO matches 'C++' (no space) tag: #{Intern.with_skill('C ++').where(id: intern_no_space.id).exists?} (BUG if true)"
puts "Search 'C++' matches 'C++' tag: #{Intern.with_skill('C++').where(id: intern_no_space.id).exists?} (expect true)"
puts "Search 'C++' incorrectly ALSO matches 'C ++' (with space) tag: #{Intern.with_skill('C++').where(id: intern_with_space.id).exists?} (BUG if true)"

intern_with_space.destroy
intern_no_space.destroy
