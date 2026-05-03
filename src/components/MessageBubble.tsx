import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
          isAI
            ? "rounded-tl-sm bg-card border border-border text-foreground shadow-sm"
            : "rounded-tr-sm bg-primary text-primary-foreground shadow-md shadow-primary/15"
        }`}
      >
        {isAI ? (
          <div className="space-y-2 [&_strong]:block [&_strong]:text-primary [&_strong]:font-semibold [&_strong]:mt-3 [&_strong]:mb-1 [&_strong:first-child]:mt-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:text-foreground/90 [&_p]:text-foreground/90 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_hr]:my-3 [&_hr]:border-border [&_a]:text-primary [&_a]:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{text}</div>
        )}
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
