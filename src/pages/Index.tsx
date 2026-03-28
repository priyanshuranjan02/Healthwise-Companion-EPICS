import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import CategoryCards from "@/components/CategoryCards";
import ChatInterface from "@/components/ChatInterface";
import EmergencyModal from "@/components/EmergencyModal";
import LanguageToggle from "@/components/LanguageToggle";
import { translations, type Language } from "@/lib/i18n";

const Index = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [view, setView] = useState<"home" | "chat">("home");
  const [showEmergency, setShowEmergency] = useState(false);

  const t = translations[language];

  if (view === "chat") {
    return (
      <>
        <ChatInterface t={t} onBack={() => setView("home")} onEmergency={() => setShowEmergency(true)} />
        {showEmergency && <EmergencyModal t={t} onClose={() => setShowEmergency(false)} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <span className="text-lg font-bold text-foreground">
          <span className="text-gradient-primary">AI</span> HealthBot
        </span>
        <LanguageToggle language={language} onToggle={setLanguage} />
      </nav>

      <HeroSection t={t} onStartCheck={() => setView("chat")} onEmergency={() => setShowEmergency(true)} />
      <CategoryCards t={t} onSelect={() => setView("chat")} />

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AI HealthBot — Emergent AI. For educational purposes only.</p>
      </footer>

      {showEmergency && <EmergencyModal t={t} onClose={() => setShowEmergency(false)} />}
    </div>
  );
};

export default Index;
