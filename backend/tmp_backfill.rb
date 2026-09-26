require_relative "config/environment"

Intern.find_each do |intern|
  updates = {}
  Intern::TAG_COLUMNS.each do |col|
    value = intern.read_attribute(col)
    next if value.nil?

    normalized = Intern.normalize_tag_list(value)
    updates[col] = normalized if normalized != value
  end
  next if updates.empty?

  intern.update_columns(updates)
  puts "id=#{intern.id} normalized: #{updates.inspect}"
end
puts "done"
