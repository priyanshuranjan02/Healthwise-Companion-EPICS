import { Globe } from "lucide-react";
import type { Language } from "@/lib/i18n";

interface LanguageToggleProps {
  language: Language;
  onToggle: (lang: Language) => void;
}

const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  return (
    <button
      onClick={() => onToggle(language === "en" ? "hi" : "en")}
      className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:shadow-md"
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4 text-primary" />
      <span>{language === "en" ? "हिंदी" : "English"}</span>
    </button>
  );
};

export default LanguageToggle;
