/**
 * The one place in the codebase that writes raw HTML. A ld+json script must
 * hold unescaped JSON, and React has no other way to emit it.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
