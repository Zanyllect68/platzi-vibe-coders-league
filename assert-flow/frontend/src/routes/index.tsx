import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const Route = createFileRoute("/")({
  component: Index,
});

type AIFeedback = {
  score: number;
  tone: string;
  feedback: string;
  suggestion: string;
};

type Option = {
  text: string;
  score: number;
  feedback: string;
};

type Scenario = {
  title: string;
  context: string;
  interlocutor: string;
  role: string;
  dialogue: string;
  options: Option[];
};

const FALLBACK_SCENARIOS: Scenario[] = [
  {
    title: "Pidiendo un aumento",
    context: "Estás en una reunión con tu jefe. Llevas dos años en la empresa, superando tus objetivos, y consideras que es momento de pedir un aumento salarial.",
    interlocutor: "Tu jefe",
    role: "Director de área",
    dialogue: "Bueno, ¿de qué querías hablar? Tengo otra reunión en 15 minutos, así que vamos al grano.",
    options: [
      { text: "Perdona que te robe tiempo… si no es buen momento lo dejamos para otro día.", score: 2, feedback: "Pasivo. Estás minimizando tu petición antes de hacerla." },
      { text: "He preparado datos concretos sobre mis resultados. Quiero hablar de una revisión salarial.", score: 9, feedback: "Asertivo. Directo, con base objetiva y respetuoso del tiempo." },
      { text: "Llevo dos años aquí sin subida. Es hora de que reconozcáis mi trabajo.", score: 4, feedback: "Agresivo. Suena a reclamo emocional, no a negociación." },
      { text: "Quería comentarte algunas cosas… bueno, varias… no sé si ahora.", score: 1, feedback: "Muy pasivo. Falta claridad y confianza." },
    ],
  },
  {
    title: "Compañero que interrumpe",
    context: "En una junta de equipo, un compañero te interrumpe por tercera vez mientras presentas una propuesta importante.",
    interlocutor: "Compañero de equipo",
    role: "Colega senior",
    dialogue: "Perdona, pero eso no va a funcionar. Yo creo que deberíamos hacer lo que propuse la semana pasada…",
    options: [
      { text: "Vale, tienes razón, sigue tú.", score: 1, feedback: "Pasivo. Cedes tu espacio sin defender tu idea." },
      { text: "¿Puedes dejar de interrumpirme de una vez? Es la tercera.", score: 4, feedback: "Agresivo. Válido el límite, pero el tono escala el conflicto." },
      { text: "Voy a terminar mi punto y después escucho tu propuesta con atención.", score: 10, feedback: "Asertivo. Firme, sin agresión, y abre espacio al otro." },
      { text: "(Sigues hablando más fuerte para taparle)", score: 3, feedback: "Pasivo-agresivo. Evitas la conversación real." },
    ],
  },
  {
    title: "Amigo que cruza un límite",
    context: "Un amigo cercano hace un comentario sobre tu vida personal delante de otras personas que te incomoda profundamente.",
    interlocutor: "Amigo cercano",
    role: "Persona de confianza",
    dialogue: "¡Anda ya, no te lo tomes así! Era solo una broma, no seas tan sensible.",
    options: [
      { text: "Nada, olvídalo, no pasa nada.", score: 1, feedback: "Pasivo. Guardas malestar que reaparecerá después." },
      { text: "Eres un imbécil, no vuelvas a hablarme así.", score: 3, feedback: "Agresivo. Cierras la puerta al diálogo." },
      { text: "Ese comentario me incomodó. Prefiero que no bromees con eso, sobre todo en público.", score: 10, feedback: "Asertivo. Expresas emoción y petición concreta." },
      { text: "Bueno… ya hablamos luego (cambias de tema)", score: 2, feedback: "Evitativo. El tema queda pendiente y erosiona la relación." },
    ],
  },
];

const MAX_SCORE = 30;

const leadSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Introduce un email válido" })
    .max(255, { message: "Email demasiado largo" }),
});

function Index() {
  const [started, setStarted] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const active = scenarios ?? FALLBACK_SCENARIOS;
  const scenario = active[stepIdx];
  const total = scores.reduce((a, b) => a + b, 0);
  const progress = ((stepIdx + (selected !== null ? 1 : 0)) / active.length) * 100;

  async function handleStart() {
    setStarted(true);
    setScenariosLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate-scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scenarios?.length === 3) {
          setScenarios(data.scenarios);
        }
      }
    } catch {
      // fallback a escenarios fijos
    } finally {
      setScenariosLoading(false);
    }
  }

  async function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setScores((s) => [...s, scenario.options[i].score]);
    setAiFeedback(null);
    setAiError(null);
    setAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_title: scenario.title,
          scenario_context: scenario.context,
          interlocutor_name: scenario.interlocutor,
          interlocutor_role: scenario.role,
          interlocutor_dialogue: scenario.dialogue,
          selected_option_text: scenario.options[i].text,
        }),
      });
      if (!res.ok) throw new Error("Error del servidor");
      const data: AIFeedback = await res.json();
      setAiFeedback(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error al analizar");
    } finally {
      setAiLoading(false);
    }
  }

  function next() {
    if (stepIdx + 1 >= active.length) {
      setDone(true);
    } else {
      setStepIdx((n) => n + 1);
      setSelected(null);
      setAiFeedback(null);
      setAiError(null);
    }
  }

  if (!started) return <Intro onStart={handleStart} />;
  if (scenariosLoading) return <LoadingScreen />;
  if (done) return <Results total={total} max={MAX_SCORE} />;

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <StepHeader current={stepIdx + 1} total={active.length} progress={progress} title={scenario.title} />

        <article key={stepIdx} className="step-fade-in mt-8 space-y-6">
          <SituationCard context={scenario.context} />

          <InterlocutorBlock
            name={scenario.interlocutor}
            role={scenario.role}
            dialogue={scenario.dialogue}
          />

          <section aria-label="Tus opciones de respuesta" className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              ¿Qué respondes?
            </p>
            <div className="grid gap-3">
              {scenario.options.map((opt, i) => (
                <OptionCard
                  key={i}
                  index={i}
                  option={opt}
                  state={
                    selected === null
                      ? "idle"
                      : selected === i
                        ? "selected"
                        : "dim"
                  }
                  onClick={() => choose(i)}
                />
              ))}
            </div>
          </section>

          {selected !== null && (
            <Feedback
              option={scenario.options[selected]}
              aiFeedback={aiFeedback}
              aiLoading={aiLoading}
              aiError={aiError}
              onNext={next}
              last={stepIdx + 1 >= active.length}
            />
          )}
        </article>
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-6 text-lg text-muted-foreground">Generando escenarios con IA…</p>
      </div>
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, oklch(0.78 0.15 70 / 0.15), transparent 50%), radial-gradient(circle at 85% 80%, oklch(0.5 0.12 220 / 0.2), transparent 55%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 py-16">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Simulador interactivo
        </span>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Descubre cómo manejas los <span className="italic text-primary">conflictos</span> reales.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Tres escenarios. Decisiones difíciles. En 3 minutos sabrás tu Puntaje de Asertividad
          y qué patrones te están frenando.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            onClick={onStart}
            className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Empezar simulador →
          </Button>
          <span className="text-sm text-muted-foreground">3 min · Sin registro para empezar</span>
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Escenarios reales", d: "Trabajo, amistad, familia." },
            { n: "02", t: "Feedback inmediato", d: "En cada decisión." },
            { n: "03", t: "Informe personalizado", d: "Con guion listo para usar." },
          ].map((f) => (
            <div
              key={f.n}
              className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur"
            >
              <div className="text-xs font-medium tracking-widest text-primary">{f.n}</div>
              <div className="mt-2 font-semibold text-foreground">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StepHeader({
  current,
  total,
  progress,
  title,
}: {
  current: number;
  total: number;
  progress: number;
  title: string;
}) {
  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
        <span>
          Paso <span className="text-primary">{current}</span> de {total}
        </span>
        <span>Escenario</span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
      </div>
      <Progress value={progress} className="h-1.5 bg-secondary" />
    </header>
  );
}

function SituationCard({ context }: { context: string }) {
  return (
    <div
      className="rounded-2xl border border-border p-6 shadow-[var(--shadow-elegant)]"
      style={{ background: "var(--gradient-surface)" }}
    >
      <div className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">La situación</div>
      <p className="text-lg leading-relaxed text-foreground/95">{context}</p>
    </div>
  );
}

function InterlocutorBlock({
  name,
  role,
  dialogue,
}: {
  name: string;
  role: string;
  dialogue: string;
}) {
  const initial = name.charAt(0);
  return (
    <div className="flex items-start gap-4">
      <div
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-lg font-semibold text-foreground"
        style={{ boxShadow: "inset 0 0 20px oklch(0 0 0 / 0.4)" }}
      >
        {initial}
      </div>
      <div className="relative flex-1 rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-4">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">· {role}</span>
        </div>
        <p className="text-base leading-relaxed text-foreground/90">"{dialogue}"</p>
      </div>
    </div>
  );
}

function OptionCard({
  index,
  option,
  state,
  onClick,
}: {
  index: number;
  option: Option;
  state: "idle" | "selected" | "dim";
  onClick: () => void;
}) {
  const letters = ["A", "B", "C", "D"];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle" && state !== "selected"}
      className={cn(
        "group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all",
        state === "idle" &&
          "border-border bg-card hover:border-primary/60 hover:bg-card/80 cursor-pointer",
        state === "selected" &&
          "border-primary bg-primary/10 shadow-[var(--shadow-glow)]",
        state === "dim" && "border-border bg-card/40 opacity-40",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition",
          state === "selected"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-secondary text-muted-foreground group-hover:text-foreground",
        )}
      >
        {letters[index]}
      </span>
      <span className="flex-1 text-base leading-relaxed text-foreground">{option.text}</span>
    </button>
  );
}

function Feedback({
  option,
  aiFeedback,
  aiLoading,
  aiError,
  onNext,
  last,
}: {
  option: Option;
  aiFeedback: AIFeedback | null;
  aiLoading: boolean;
  aiError: string | null;
  onNext: () => void;
  last: boolean;
}) {
  const tone =
    option.score >= 8 ? "Asertivo" : option.score >= 5 ? "En camino" : "Patrón a revisar";
  return (
    <div className="step-fade-in rounded-2xl border border-primary/40 bg-primary/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-primary">Feedback</div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {tone} · +{option.score} pts
          </div>
        </div>
        <Button
          onClick={onNext}
          className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:brightness-110"
        >
          {last ? "Ver mi resultado" : "Siguiente escenario"} →
        </Button>
      </div>

      {aiLoading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analizando tu respuesta con IA…
        </div>
      ) : aiError ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">{option.feedback}</p>
      ) : aiFeedback ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm leading-relaxed text-foreground/85">{aiFeedback.feedback}</p>
          <p className="text-sm leading-relaxed text-primary/80">{aiFeedback.suggestion}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">{option.feedback}</p>
      )}
    </div>
  );
}

function Results({ total, max }: { total: number; max: number }) {
  const pct = Math.round((total / max) * 100);
  const label = useMemo(() => {
    if (pct >= 80) return { t: "Asertivo consolidado", d: "Comunicas con firmeza y respeto." };
    if (pct >= 55) return { t: "Asertivo en desarrollo", d: "Tienes la base, refina tus patrones." };
    if (pct >= 30) return { t: "Estilo mixto", d: "Alternas entre pasivo y agresivo según el contexto." };
    return { t: "Estilo evitativo", d: "Tiendes a callar o ceder ante el conflicto." };
  }, [pct]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = leadSchema.safeParse({ email });
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? "Email inválido");
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Resultado final</span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Tu puntaje de asertividad
          </h1>
        </header>

        <ScoreDial pct={pct} />

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-primary">Tu perfil</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{label.t}</div>
          <p className="mt-2 text-muted-foreground">{label.d}</p>
        </div>

        <section
          className="relative overflow-hidden rounded-3xl border border-primary/30 p-8 sm:p-10"
          style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Desbloquea tu informe completo
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Recibe gratis tu análisis de estilo de comunicación, los <strong className="text-foreground">3 errores clave</strong> que estás cometiendo y un <strong className="text-foreground">guion personalizado listo para usar</strong> en tu próximo conflicto.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 p-5">
                <div className="text-lg font-semibold text-foreground">¡Listo! 🎯</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Te enviaremos tu informe a <span className="text-foreground">{email}</span> en los próximos minutos.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-full border-border bg-background px-6 text-base text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-14 rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110"
                >
                  Enviarme el informe
                </Button>
              </form>
            )}
            {error && !submitted && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Sin spam. Cancela cuando quieras.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ScoreDial({ pct }: { pct: number }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg width="220" height="220" viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={r} strokeWidth="14" className="fill-none stroke-secondary" />
          <circle
            cx="100"
            cy="100"
            r={r}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="fill-none stroke-[color:var(--primary)] transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-semibold tracking-tight text-foreground">{pct}</div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}
