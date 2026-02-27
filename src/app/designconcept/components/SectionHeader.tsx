export const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(17,17,17,0.10)",
  borderRadius: 18,
  boxShadow: "0 10px 24px rgba(17,17,17,0.06)",
} as const;

export function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full max-w-[1000px] mx-auto mb-6">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-black/50">
          {number}
        </span>
        <div
          className="flex-1 border-b border-black/10"
          style={{ transform: "translateY(-4px)" }}
        />
      </div>
      <h2 className="font-[var(--font-playfair)] text-2xl md:text-3xl font-normal text-black tracking-tight mt-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-black/60 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
