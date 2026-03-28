import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

interface Diagnosis {
  disease: string;
  confidence: number;
  severity: "low" | "moderate" | "high";
  recommendations: string[];
  symptoms: string[];
}

interface ResultCardProps {
  t: Record<string, string>;
  diagnosis: Diagnosis;
}

const actionMap = {
  low: { icon: CheckCircle2, text: "Home care recommended", color: "text-safe" },
  moderate: { icon: AlertTriangle, text: "Consult a doctor soon", color: "text-warning" },
  high: { icon: XCircle, text: "Seek emergency care", color: "text-critical" },
};

const ResultCard = ({ t, diagnosis }: ResultCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const action = actionMap[diagnosis.severity];
  const ActionIcon = action.icon;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
      {/* Condition header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.condition}</p>
          <h3 className="text-xl font-bold text-foreground">{diagnosis.disease}</h3>
        </div>
        <SeverityBadge severity={diagnosis.severity} t={t} />
      </div>

      {/* Confidence */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.confidence}</span>
          <span className="font-bold text-foreground">{diagnosis.confidence}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              diagnosis.severity === "low" ? "bg-safe" : diagnosis.severity === "moderate" ? "bg-warning" : "bg-critical"
            }`}
            style={{ width: `${diagnosis.confidence}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="mx-6 flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3">
        <ActionIcon className={`h-5 w-5 ${action.color}`} />
        <span className="text-sm font-semibold text-foreground">{action.text}</span>
      </div>

      {/* Recommendations */}
      <div className="px-6 py-4">
        <p className="mb-3 text-sm font-semibold text-foreground">{t.recommendations}</p>
        <ul className="space-y-2">
          {diagnosis.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Explainability */}
      <div className="border-t border-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-primary hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t.whyResult}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded && (
          <div className="px-6 pb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.symptomsUsed}</p>
            <div className="flex flex-wrap gap-2">
              {diagnosis.symptoms.map((sym) => (
                <span key={sym} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
