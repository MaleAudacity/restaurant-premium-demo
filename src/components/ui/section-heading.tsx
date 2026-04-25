export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <p
        className="text-xs font-semibold uppercase tracking-[0.35em]"
        style={{ color: "var(--accent)" }}
      >
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h2
          className="font-serif text-3xl md:text-4xl"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h2>
        <p
          className="max-w-2xl text-sm leading-7 md:text-base"
          style={{ color: "var(--muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
