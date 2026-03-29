import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

import { toast } from "sonner";
import MessageBubble from "./MessageBubble";
import ResultCard from "./ResultCard";

interface Diagnosis {
  disease: string;
  confidence: number;
  severity: "low" | "moderate" | "high";
  recommendations: string[];
  symptoms: string[];
}

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  isResult?: boolean;
  diagnosis?: Diagnosis;
}

interface ChatInterfaceProps {
  t: Record<string, string>;
  language: string;
  onBack: () => void;
  onEmergency: () => void;
}

const quickSymptoms = ["fever", "headache", "cough"];

const ChatInterface = ({ t, language, onBack, onEmergency }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "ai", text: "Hello! I'm your AI Health Assistant. Please describe your symptoms and I'll help assess your condition." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);
  const [step, setStep] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setStep(2);

    try {
      // TODO: Replace this with your own model API call
      // Example:
      // const response = await fetch("https://your-model-endpoint.com/analyze", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ symptoms: msg, language }),
      // });
      // const diagnosis: Diagnosis = await response.json();

      // Placeholder response until you integrate your model
      const diagnosis: Diagnosis = {
        disease: "Pending Integration",
        confidence: 0,
        severity: "low",
        recommendations: ["Please integrate your own model to get real results."],
        symptoms: [msg],
      };
      setCurrentDiagnosis(diagnosis);
      setStep(3);

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: "Based on your symptoms, here is my assessment:",
        isResult: true,
        diagnosis,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setShowResult(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze symptoms. Please try again.");
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: "I'm sorry, I encountered an error analyzing your symptoms. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStep(1);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.title}
        </button>
        <div className="flex items-center gap-2 text-xs font-medium">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s}
              </div>
              <span className="hidden sm:inline text-muted-foreground">
                {s === 1 ? t.step1 : s === 2 ? t.step2 : t.step3}
              </span>
              {s < 3 && <div className={`h-px w-4 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
        <button onClick={onEmergency} className="rounded-full bg-critical/10 px-3 py-1.5 text-xs font-semibold text-critical hover:bg-critical hover:text-critical-foreground transition-colors">
          🚨 SOS
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble role={msg.role} text={msg.text} />
              {msg.isResult && showResult && msg.diagnosis && (
                <div className="mt-3">
                  <ResultCard t={t} diagnosis={msg.diagnosis} />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {t.analyzing}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick symptoms */}
      {!showResult && (
        <div className="border-t border-border bg-card/50 px-4 py-2">
          <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto">
            {quickSymptoms.map((sym) => (
              <button
                key={sym}
                onClick={() => handleSend(t[sym])}
                disabled={isTyping}
                className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {t[sym]}
              </button>
            ))}
            <button
              onClick={() => handleSend("I have fever, fatigue, and body ache for 2 days")}
              disabled={isTyping}
              className="shrink-0 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              🎯 {t.tryDemo}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t.chatPlaceholder}
            disabled={isTyping}
            className="flex-1 rounded-2xl border border-border bg-muted/50 px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-40 disabled:shadow-none"
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
