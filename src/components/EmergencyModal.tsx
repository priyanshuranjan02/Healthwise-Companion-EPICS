import { AlertTriangle, Phone, MapPin, X } from "lucide-react";

interface EmergencyModalProps {
  t: Record<string, string>;
  onClose: () => void;
}

const EmergencyModal = ({ t, onClose }: EmergencyModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-critical px-6 py-6 text-center text-critical-foreground">
          <AlertTriangle className="mx-auto mb-3 h-12 w-12" />
          <h2 className="text-xl font-bold">{t.emergencyTitle}</h2>
          <p className="mt-1 text-sm opacity-90">{t.emergencyMsg}</p>
        </div>

        {/* Info */}
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center gap-3 rounded-2xl bg-critical/5 px-4 py-3">
            <Phone className="h-5 w-5 text-critical" />
            <span className="text-sm font-semibold text-foreground">{t.emergencyNumber}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{t.nearestHospital}</span>
          </div>
        </div>

        {/* Close */}
        <div className="border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-muted py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80"
          >
            {t.close}
          </button>
        </div>

        <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-critical-foreground/20 p-1 text-critical-foreground hover:bg-critical-foreground/30 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EmergencyModal;
