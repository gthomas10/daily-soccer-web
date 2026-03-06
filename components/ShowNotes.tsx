import DOMPurify from "isomorphic-dompurify";

interface ShowNotesProps {
  html: string;
}

export default function ShowNotes({ html }: ShowNotesProps) {
  const cleanHtml = DOMPurify.sanitize(html);

  return (
    <section className="mx-auto max-w-[680px]">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Show Notes
      </h2>
      <div
        className="prose-notes space-y-4 text-text-primary [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_p]:leading-relaxed [&_p]:text-text-secondary [&_strong]:text-text-primary [&_a]:text-accent-emerald [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </section>
  );
}
