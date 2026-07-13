import { PawPrint, Stethoscope, Scissors, BedDouble, Syringe, MapPin, CreditCard } from "lucide-react"

export const SUGGESTIONS = [
  { icon: Stethoscope, label: "Consulta veterinaria", prompt: "¿Cuánto cuesta una consulta veterinaria general?" },
  { icon: Scissors, label: "Grooming", prompt: "¿Qué precios tienen para baño y corte?" },
  { icon: BedDouble, label: "Hotel", prompt: "¿Cómo funciona el hotel para mascotas y cuánto cuesta?" },
  { icon: Syringe, label: "Vacunas", prompt: "¿Qué vacunas ofrecen y cuánto valen?" },
  { icon: MapPin, label: "Sedes", prompt: "¿Dónde están ubicadas sus sedes y qué horarios tienen?" },
  { icon: CreditCard, label: "Medios de pago", prompt: "¿Qué métodos de pago aceptan?" },
]

export function ChatEmpty({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <PawPrint className="size-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-balance font-heading text-2xl font-extrabold tracking-tight text-foreground">
        Hola, soy Paty
      </h2>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        Tu asistente de Patitas Felices. Pregúntame por servicios, precios, horarios, sedes y más.
      </p>

      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-2.5">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
