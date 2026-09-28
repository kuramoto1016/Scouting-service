export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <span className="field-error-text">
      {messages.join(", ")}
    </span>
  );
}
