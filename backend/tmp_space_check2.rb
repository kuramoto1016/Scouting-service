require_relative "config/environment"

def normalized_sql(column)
  # Normalize only whitespace adjacent to comma delimiters, not spaces inside tag values.
  "REPLACE(REPLACE(#{column}, ', ', ','), ' ,', ',')"
end

ActiveRecord::Base.with_connection do |c|
  [
    ["C ++, Ruby", "C ++,Ruby"],
    ["Ruby , Go", "Ruby,Go"],
    ["Ruby  ,  Go", nil], # double spaces - edge case, document behavior
  ].each do |input, _expected|
    result = c.select_value("SELECT #{normalized_sql("?")}".gsub("?", c.quote(input)))
    puts "#{input.inspect} => #{result.inspect}"
  end
end
