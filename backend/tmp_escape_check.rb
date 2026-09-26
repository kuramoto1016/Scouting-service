require_relative "config/environment"

# Create an intern whose skill contains a literal underscore, which is a LIKE wildcard.
intern = Intern.find_or_create_by!(email: "escapetest@example.com") do |i|
  i.name = "Escape Test"
  i.password = "password12345"
end
intern.update!(skills: "C_Sharp, Ruby")

# Now search for "C_Sharp" via with_skill and see if it matches correctly,
# and also check whether "CXSharp" (any single char in place of _) incorrectly matches
# due to unescaped underscore being treated as a LIKE wildcard.
puts "Search 'C_Sharp': #{Intern.with_skill('C_Sharp').where(id: intern.id).exists?}"

# Simulate: does the LIKE wildcard `_` (matching any single char) cause a false
# positive by matching a DIFFERENT stored value that differs by one character?
other = Intern.find_or_create_by!(email: "escapetest2@example.com") do |i|
  i.name = "Escape Test 2"
  i.password = "password12345"
end
other.update!(skills: "CXSharp")

puts "Search 'C_Sharp' should NOT match CXSharp intern: #{Intern.with_skill('C_Sharp').where(id: other.id).exists?}"

intern.destroy
other.destroy
