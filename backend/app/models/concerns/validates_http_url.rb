module ValidatesHttpUrl
  extend ActiveSupport::Concern

  class_methods do
    def validates_http_url(*attribute_names)
      attribute_names.each do |attribute_name|
        validate_method_name = :"#{attribute_name}_must_be_valid_http_url"

        define_method(validate_method_name) do
          value = public_send(attribute_name)
          return if value.blank?

          uri = URI.parse(value)
          unless uri.is_a?(URI::HTTP) && uri.host.present?
            errors.add(attribute_name, "is invalid")
          end
        rescue URI::InvalidURIError
          errors.add(attribute_name, "is invalid")
        end
        private validate_method_name

        validate validate_method_name
      end
    end
  end
end
