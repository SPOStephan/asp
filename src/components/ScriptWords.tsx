// A heading with one phrase of it in the golden script font. The phrase is chosen in the
// CMS ("Wörter in Schreibschrift") and must appear in the heading; otherwise the heading
// stays plain. The full heading remains one text for editing, search engines and AI.
export function ScriptWords({ text, script, className }: { text?: string; script?: string; className: string }) {
  const value = text ?? '';
  const phrase = script?.trim();
  const at = phrase ? value.toLowerCase().indexOf(phrase.toLowerCase()) : -1;
  if (!phrase || at < 0) return <>{value}</>;
  return (
    <>
      {value.slice(0, at)}
      <span className={className}>{value.slice(at, at + phrase.length)}</span>
      {value.slice(at + phrase.length)}
    </>
  );
}
