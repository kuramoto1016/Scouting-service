require_relative "config/environment"

Intern.find_each do |intern|
  Intern::TAG_COLUMNS.each do |col|
    value = intern.read_attribute(col)
    next if value.nil?

    normalized = Intern.normalize_tag_list(value)
    if normalized != value
      puts "id=#{intern.id} #{col}: #{value.inspect} -> #{normalized.inspect}"
    end
  end
end
