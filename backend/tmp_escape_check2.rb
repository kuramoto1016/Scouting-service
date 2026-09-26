require_relative "config/environment"

value = "C_Sharp"
escaped = Intern.sanitize_sql_like(value.strip)
puts "escaped: #{escaped.inspect}"
pattern = "%,#{escaped.delete(' ')},%"
puts "pattern: #{pattern.inspect}"

# Show the actual SQL generated
sql = Intern.with_skill(value).to_sql
puts "SQL: #{sql}"
