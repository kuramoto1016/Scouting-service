sql_fragment = "(',' || REPLACE(skills, ' ', '') || ',') LIKE ? ESCAPE '\\'"
puts sql_fragment
puts sql_fragment.length
