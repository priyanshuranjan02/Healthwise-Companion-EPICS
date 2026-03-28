interface SeverityBadgeProps {
  severity: "low" | "moderate" | "high";
  t: Record<string, string>;
}

const config = {
  low: { bg: "bg-safe/15", text: "text-safe", dot: "bg-safe", label: "low" },
  moderate: { bg: "bg-warning/15", text: "text-warning", dot: "bg-warning", label: "moderate" },
  high: { bg: "bg-critical/15", text: "text-critical", dot: "bg-critical", label: "high" },
};

const SeverityBadge = ({ severity, t }: SeverityBadgeProps) => {
  const c = config[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot} animate-pulse-soft`} />
      {t[c.label]}
    </span>
  );
};

export default SeverityBadge;
