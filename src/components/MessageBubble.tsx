import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "ai";
  text: string;
}

const MessageBubble = ({ role, text }: MessageBubbleProps) => {
  const isAI = role === "ai";
  return (
    <div className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI
            ? "rounded-tl-sm bg-card border border-border text-foreground shadow-sm"
            : "rounded-tr-sm bg-primary text-primary-foreground shadow-md shadow-primary/15"
        }`}
      >
        {text}
      </div>
      {!isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
