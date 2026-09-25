require "uri"

def valid?(str)
  uri = URI.parse(str)
  uri.is_a?(URI::HTTP) && uri.host.present?
rescue URI::InvalidURIError
  false
end

# Need ActiveSupport's blank?/present? for standalone check
class NilClass; def present?; false; end; end
class String; def present?; !strip.empty?; end; end

[
  "https://",
  "http://",
  "https://a",
  "https://github.com/example",
  "http://example.com",
  "javascript:alert(1)",
  "ftp://example.com",
  "not a url",
  "https:// javascript:alert(1)",
].each do |s|
  puts "#{s.inspect} => #{valid?(s)}"
end
