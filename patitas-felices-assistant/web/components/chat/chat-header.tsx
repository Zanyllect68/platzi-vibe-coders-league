import { PawPrint } from "lucide-react"

export function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <h1 className="font-heading text-sm font-extrabold tracking-tight text-foreground">Paty</h1>
            <p className="text-xs text-muted-foreground">Patitas Felices · Medellín</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium text-accent-foreground">En línea</span>
        </div>
      </div>
    </header>
  )
}
