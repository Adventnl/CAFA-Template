/**
 * The one place in the codebase that writes raw HTML. A ld+json script must
 * hold unescaped JSON, and React has no other way to emit it.
 *
 * Every `<` leaves as its JSON escape, and that is not decoration: the payload
 * is built from content an editor typed into CAFA-Admin, and a `</script>` in
 * any string — a work's summary, a mentor's note — would close this element
 * and spill the rest of the document into the page as markup. The escape is
 * the same character to a JSON parser and inert to an HTML one, so a crawler
 * reads exactly what was written and the tag cannot be broken out of.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }}
    />
  );
}
