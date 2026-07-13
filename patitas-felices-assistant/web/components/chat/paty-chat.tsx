"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowUp, Square } from "lucide-react"
import { ChatHeader } from "./chat-header"
import { ChatEmpty } from "./chat-empty"
import { ChatMessage, TypingIndicator } from "./chat-message"

function getText(message: { parts: Array<{ type: string; text?: string }> }) {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
}

export function PatyChat() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const isBusy = status === "submitted" || status === "streaming"
  const isEmpty = messages.length === 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  function submit(text: string) {
    const value = text.trim()
    if (!value || isBusy) return
    sendMessage({ text: value })
    setInput("")
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ChatHeader />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4">
          {isEmpty ? (
            <ChatEmpty onPick={submit} />
          ) : (
            <div className="flex flex-col gap-4 py-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role as "user" | "assistant"}
                  text={getText(message)}
                />
              ))}
              {status === "submitted" && <TypingIndicator />}
              {error && (
                <div className="flex items-start gap-3">
                  <div className="max-w-[80%] text-pretty rounded-2xl rounded-tl-sm bg-destructive/10 px-4 py-2.5 text-sm leading-relaxed text-destructive ring-1 ring-destructive/20">
                    Ups, no pude conectarme en este momento. Por favor intenta de nuevo en unos segundos. 📞
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
            className="flex items-end gap-2 rounded-2xl border border-border bg-card p-1.5 pl-4 shadow-sm transition-colors focus-within:border-primary/50"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              rows={1}
              placeholder="Escribe tu pregunta..."
              aria-label="Escribe tu pregunta"
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Detener respuesta"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-muted"
              >
                <Square className="size-4 fill-current" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Enviar mensaje"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Paty responde solo con información de Patitas Felices.
          </p>
        </div>
      </div>
    </div>
  )
}
