import { Stethoscope, AlertTriangle } from "lucide-react";
import heroImage from "@/assets/hero-health.png";

interface HeroSectionProps {
  t: Record<string, string>;
  onStartCheck: () => void;
  onEmergency: () => void;
}

const HeroSection = ({ t, onStartCheck, onEmergency }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
      <div className="container mx-auto flex flex-col items-center gap-10 md:flex-row md:justify-between">
        {/* Text */}
        <div className="flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <Stethoscope className="h-4 w-4" />
            {t.subtitle}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t.title.split(" ").map((word, i) =>
              word === "AI" || word === "हेल्थबॉट" || word === "HealthBot" ? (
                <span key={i} className="text-gradient-primary">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">{t.tagline}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStartCheck}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Stethoscope className="h-5 w-5" />
              {t.startCheck}
            </button>
            <button
              onClick={onEmergency}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-critical bg-critical/5 px-8 py-4 text-base font-semibold text-critical transition-all hover:bg-critical hover:text-critical-foreground"
            >
              <AlertTriangle className="h-5 w-5" />
              {t.emergencyHelp}
            </button>
          </div>
        </div>
        {/* Illustration */}
        <div className="animate-float">
          <img
            src={heroImage}
            alt="AI HealthBot illustration"
            width={800}
            height={600}
            className="w-64 md:w-80 lg:w-96 drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
