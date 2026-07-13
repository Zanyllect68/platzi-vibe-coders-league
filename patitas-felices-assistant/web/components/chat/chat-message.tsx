import { PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

type ChatMessageProps = {
  role: "user" | "assistant" | "system"
  text: string
}

export function ChatMessage({ role, text }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex w-full items-start gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PawPrint className="size-4" aria-hidden="true" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap text-pretty rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-card text-card-foreground ring-1 ring-border",
        )}
      >
        {text}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex w-full items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <PawPrint className="size-4" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-card px-4 py-3.5 ring-1 ring-border">
        <span className="sr-only">Paty está escribiendo</span>
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  )
}
