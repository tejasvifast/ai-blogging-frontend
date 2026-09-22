/**
 * Renders a JSON-LD <script>. Safe: JSON.stringify + escaping `<` prevents any
 * `</script>` breakout from user/AI-generated content.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
