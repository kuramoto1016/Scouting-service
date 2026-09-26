require_relative "config/environment"

intern = Intern.find_or_create_by!(email: "normcheck@example.com") do |i|
  i.name = "Norm Check"
  i.password = "password12345"
end

# Multiple spaces around delimiter should be normalized on save.
intern.update!(skills: "Ruby,   Go")
puts "Stored value after save: #{intern.reload.skills.inspect} (expect 'Ruby, Go')"
puts "'Go' matches after normalization: #{Intern.with_skill('Go').where(id: intern.id).exists?} (expect true)"

# Internal spaces within a tag should be preserved.
intern.update!(skills: "C ++,    C++")
puts "Stored value: #{intern.reload.skills.inspect} (expect 'C ++, C++')"
puts "'C ++' matches only the space variant: #{Intern.with_skill('C ++').where(id: intern.id).exists?} (expect true)"

other = Intern.find_or_create_by!(email: "normcheck2@example.com") do |i|
  i.name = "Norm Check 2"
  i.password = "password12345"
end
other.update!(skills: "C++")
puts "'C ++' does NOT match plain 'C++' tag: #{Intern.with_skill('C ++').where(id: other.id).exists?} (expect false)"

# Leading/trailing/extra commas and blank entries should be cleaned up.
intern.update!(skills: " Ruby ,, Go ,   ")
puts "Stored value with stray commas/blanks: #{intern.reload.skills.inspect} (expect 'Ruby, Go')"

# Regression: substring safety (Ruby vs Ruby on Rails)
intern.update!(skills: "Ruby on Rails, Python")
puts "'Ruby' does NOT match Ruby-on-Rails-only: #{Intern.with_skill('Ruby').where(id: intern.id).exists?} (expect false)"

intern.destroy
other.destroy
