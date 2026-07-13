import { useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, Download, Eye, Loader2,
  PartyPopper, Pencil, Scale, Sparkles, Users, Wallet,
} from 'lucide-react'

const STEPS = [
  { title: 'Datos de las partes', subtitle: 'Freelancer y cliente', icon: Users },
  { title: 'Proyecto y pago', subtitle: 'Alcance y tarifa', icon: Wallet },
  { title: 'Tiempos y legales', subtitle: 'Plazos y cláusulas', icon: Scale },
]

const MONEDAS = ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'CLP', 'PEN', 'UYU']

const TIPOS_TARIFA = [
  { value: 'precio_fijo', label: 'Precio fijo' },
  { value: 'por_hora', label: 'Por hora' },
  { value: 'mensual', label: 'Mensual' },
]

const FORMAS_PAGO = [
  { value: '50_50', label: '50% inicio / 50% final' },
  { value: '100_final', label: '100% al finalizar' },
  { value: 'hitos_mensuales', label: 'Hitos mensuales' },
]

const PROPIEDAD_OPTS = [
  { value: 'pasa_al_cliente', label: 'Pasa al cliente' },
  { value: 'retiene_freelancer', label: 'La retiene el freelancer' },
]

const INITIAL = {
  nombre_freelancer: '',
  email_freelancer: '',
  nombre_cliente: '',
  identificacion_cliente: '',
  titulo_proyecto: '',
  descripcion_entregables: '',
  tipo_tarifa: 'precio_fijo',
  monto_tarifa: '',
  moneda: 'COP',
  forma_pago: '50_50',
  fecha_inicio: '',
  fecha_fin_estimada: '',
  propiedad_intelectual: 'pasa_al_cliente',
  clausula_rescision_dias: '15',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function labelOf(opts, value) {
  return opts.find((o) => o.value === value)?.label ?? value
}

function formatMonto(monto, moneda) {
  const n = Number(monto)
  if (Number.isNaN(n)) return `${monto} ${moneda}`
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency', currency: moneda, maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${n.toLocaleString('es')} ${moneda}`
  }
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadPDF(data) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const mx = 56
  const mw = pw - mx * 2
  let y = 72

  const space = (n) => {
    if (y + n > doc.internal.pageSize.getHeight() - 64) {
      doc.addPage(); y = 72
    }
  }

  const para = (text, size = 11, gap = 14) => {
    doc.setFont('times', 'normal'); doc.setFontSize(size)
    doc.splitTextToSize(text, mw).forEach((line) => {
      space(size + 4); doc.text(line, mx, y); y += size + 4
    })
    y += gap
  }

  const heading = (text) => {
    space(30); y += 6
    doc.setFont('times', 'bold'); doc.setFontSize(12)
    doc.text(text, mx, y); y += 18
  }

  const rescision = Number(data.clausula_rescision_dias)

  doc.setFont('times', 'bold'); doc.setFontSize(18)
  doc.text('Contrato de Prestación de Servicios Freelance', pw / 2, y, { align: 'center' })
  y += 24
  doc.setFont('times', 'italic'); doc.setFontSize(11)
  doc.text(data.titulo_proyecto, pw / 2, y, { align: 'center' })
  y += 30

  heading('1. Partes')
  para(`El presente contrato se celebra entre ${data.nombre_freelancer} (${data.email_freelancer}), en adelante «el Freelancer», y ${data.nombre_cliente} (identificación ${data.identificacion_cliente}), en adelante «el Cliente».`)

  heading('2. Objeto y entregables')
  para(`El Freelancer prestará los servicios correspondientes al proyecto ${data.titulo_proyecto}, cuyos entregables son: ${data.descripcion_entregables}`)

  heading('3. Tarifa y forma de pago')
  para(`La modalidad de tarifa es ${labelOf(TIPOS_TARIFA, data.tipo_tarifa)} por un monto de ${formatMonto(data.monto_tarifa, data.moneda)}. La forma de pago acordada es ${labelOf(FORMAS_PAGO, data.forma_pago)}.`)

  heading('4. Plazos')
  para(`El proyecto inicia el ${formatFecha(data.fecha_inicio)} y tiene como fecha estimada de finalización el ${formatFecha(data.fecha_fin_estimada)}.`)

  heading('5. Propiedad intelectual')
  para(`Al completarse el pago, la propiedad intelectual de los entregables ${labelOf(PROPIEDAD_OPTS, data.propiedad_intelectual).toLowerCase()}.`)

  heading('6. Rescisión')
  para(`Cualquiera de las partes podrá dar por terminado este contrato notificando por escrito con al menos ${rescision} ${rescision === 1 ? 'día' : 'días'} de anticipación.`)

  doc.setFont('times', 'italic'); doc.setFontSize(9)
  space(20)
  doc.text('Este documento es una vista previa generada automáticamente y no constituye asesoría legal.', mx, y)

  const slug = data.titulo_proyecto.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'contrato'
  doc.save(`contrato-${slug}.pdf`)
}

function validateStep(step, data) {
  const e = {}
  if (step === 0) {
    if (!data.nombre_freelancer.trim()) e.nombre_freelancer = 'Ingresa tu nombre.'
    if (!EMAIL_RE.test(data.email_freelancer)) e.email_freelancer = 'Email no válido.'
    if (!data.nombre_cliente.trim()) e.nombre_cliente = 'Ingresa el nombre del cliente.'
    if (!data.identificacion_cliente.trim()) e.identificacion_cliente = 'Ingresa la identificación del cliente.'
  }
  if (step === 1) {
    if (data.titulo_proyecto.trim().length < 5) e.titulo_proyecto = 'Mínimo 5 caracteres.'
    if (data.descripcion_entregables.trim().length < 20) e.descripcion_entregables = 'Mínimo 20 caracteres.'
    const m = Number(data.monto_tarifa)
    if (!data.monto_tarifa || Number.isNaN(m) || m <= 0) e.monto_tarifa = 'El monto debe ser mayor a 0.'
  }
  if (step === 2) {
    if (!data.fecha_inicio) e.fecha_inicio = 'Selecciona la fecha de inicio.'
    if (!data.fecha_fin_estimada) e.fecha_fin_estimada = 'Selecciona la fecha de fin.'
    if (data.fecha_inicio && data.fecha_fin_estimada && data.fecha_fin_estimada < data.fecha_inicio)
      e.fecha_fin_estimada = 'Debe ser igual o posterior al inicio.'
    const d = Number(data.clausula_rescision_dias)
    if (!d || d < 1 || d > 365) e.clausula_rescision_dias = 'Entre 1 y 365 días.'
  }
  return e
}

export default function ContractForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')

  const disabled = status === 'loading'

  const set = (key) => (value) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const progress = useMemo(
    () => ((step + (status === 'success' ? 1 : 0)) / STEPS.length) * 100,
    [step, status],
  )

  const goNext = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handlePreview = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setServerError('')
    setStatus('preview')
  }

  const confirmar = async () => {
    setStatus('loading')
    setServerError('')
    try {
      const base = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${base}/generate-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          monto_tarifa: parseFloat(data.monto_tarifa),
          clausula_rescision_dias: parseInt(data.clausula_rescision_dias, 10),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        const msg = Array.isArray(err.detail)
          ? err.detail.map((e) => e.msg).join(' | ')
          : err.detail || 'Error al enviar los datos'
        throw new Error(msg)
      }
      setStatus('success')
    } catch (err) {
      setServerError(err.message)
      setStatus('preview')
    }
  }

  const reset = () => {
    setData(INITIAL)
    setErrors({})
    setStep(0)
    setStatus('idle')
    setServerError('')
  }

  /* ── Preview / Loading ── */
  if (status === 'preview' || status === 'loading') {
    const rescision = Number(data.clausula_rescision_dias)
    return (
      <div className="animate-step rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Vista previa</p>
            <h2 className="font-display text-2xl text-foreground">Revisa tu contrato</h2>
          </div>
        </div>

        <article className="mt-8 rounded-2xl border border-border bg-background px-6 py-8 text-sm leading-relaxed text-foreground sm:px-10 sm:py-10">
          <header className="border-b border-border pb-6 text-center">
            <h3 className="font-display text-xl text-foreground">Contrato de Prestación de Servicios Freelance</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{data.titulo_proyecto}</p>
          </header>

          <Clause title="1. Partes">
            El presente contrato se celebra entre <strong>{data.nombre_freelancer}</strong> ({data.email_freelancer}), en adelante «el Freelancer», y <strong>{data.nombre_cliente}</strong> (identificación {data.identificacion_cliente}), en adelante «el Cliente».
          </Clause>
          <Clause title="2. Objeto y entregables">
            El Freelancer prestará los servicios correspondientes al proyecto <strong>{data.titulo_proyecto}</strong>, cuyos entregables son: {data.descripcion_entregables}
          </Clause>
          <Clause title="3. Tarifa y forma de pago">
            La modalidad de tarifa es <strong>{labelOf(TIPOS_TARIFA, data.tipo_tarifa)}</strong> por un monto de <strong>{formatMonto(data.monto_tarifa, data.moneda)}</strong>. La forma de pago acordada es <strong>{labelOf(FORMAS_PAGO, data.forma_pago)}</strong>.
          </Clause>
          <Clause title="4. Plazos">
            El proyecto inicia el <strong>{formatFecha(data.fecha_inicio)}</strong> y tiene como fecha estimada de finalización el <strong>{formatFecha(data.fecha_fin_estimada)}</strong>.
          </Clause>
          <Clause title="5. Propiedad intelectual">
            Al completarse el pago, la propiedad intelectual de los entregables <strong>{labelOf(PROPIEDAD_OPTS, data.propiedad_intelectual).toLowerCase()}</strong>.
          </Clause>
          <Clause title="6. Rescisión">
            Cualquiera de las partes podrá dar por terminado este contrato notificando por escrito con al menos <strong>{rescision}</strong> {rescision === 1 ? 'día' : 'días'} de anticipación.
          </Clause>

          <p className="mt-8 text-xs text-muted-foreground">Este documento es una vista previa generada automáticamente y no constituye asesoría legal.</p>
        </article>

        {serverError && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{serverError}</p>
        )}

        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <button
            onClick={() => { setStatus('idle'); setStep(STEPS.length - 1) }}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-60"
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => downloadPDF(data)}
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> Descargar PDF
            </button>
            <button
              onClick={confirmar}
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-80"
            >
              {status === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generando…</>
              ) : (
                <><Check className="h-4 w-4" /> Confirmar y generar</>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Success ── */
  if (status === 'success') {
    return (
      <div className="animate-step rounded-3xl border border-border bg-card p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-3xl text-foreground">¡Contrato generado!</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Tu contrato para <span className="font-medium text-foreground">{data.titulo_proyecto}</span> con{' '}
          <span className="font-medium text-foreground">{data.nombre_cliente}</span> quedó listo.
          Ya puedes empezar tu proyecto con términos claros.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://platzi.com/p/andresfelipegt70/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" /> Vota en Platzi
          </a>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Crear otro contrato
          </button>
        </div>
      </div>
    )
  }

  /* ── Form Steps ── */
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
      {/* Stepper */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <div key={s.title} className="flex flex-1 items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                active ? 'border-primary bg-primary text-primary-foreground'
                  : done ? 'border-primary/30 bg-accent text-accent-foreground'
                    : 'border-border bg-secondary text-muted-foreground'
              }`}>
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-border">
                  <div className="h-px bg-primary transition-all duration-500" style={{ width: done ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Paso {step + 1} de {STEPS.length}
        </p>
        <h2 className="mt-1 font-display text-2xl text-foreground">{STEPS[step].title}</h2>
        <p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p>
      </div>

      <div className="mt-8 min-h-[320px]">
        {step === 0 && (
          <div key="s0" className="animate-step grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del freelancer" error={errors.nombre_freelancer}>
              <input className={inputCls(errors.nombre_freelancer)} placeholder="Ana Pérez" value={data.nombre_freelancer} onChange={(e) => set('nombre_freelancer')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Email del freelancer" error={errors.email_freelancer}>
              <input type="email" className={inputCls(errors.email_freelancer)} placeholder="ana@ejemplo.com" value={data.email_freelancer} onChange={(e) => set('email_freelancer')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Nombre del cliente" error={errors.nombre_cliente}>
              <input className={inputCls(errors.nombre_cliente)} placeholder="TechCorp SAS" value={data.nombre_cliente} onChange={(e) => set('nombre_cliente')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Identificación del cliente" error={errors.identificacion_cliente}>
              <input className={inputCls(errors.identificacion_cliente)} placeholder="12.345.678-9" value={data.identificacion_cliente} onChange={(e) => set('identificacion_cliente')(e.target.value)} disabled={disabled} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div key="s1" className="animate-step grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Título del proyecto" error={errors.titulo_proyecto}>
                <input className={inputCls(errors.titulo_proyecto)} placeholder="Rediseño de plataforma e-commerce" value={data.titulo_proyecto} onChange={(e) => set('titulo_proyecto')(e.target.value)} disabled={disabled} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Descripción de entregables" hint="Mínimo 20 caracteres" error={errors.descripcion_entregables}>
                <textarea rows={3} className={inputCls(errors.descripcion_entregables)} placeholder="Diseño UX/UI con 5 pantallas, prototipo navegable y entrega en Figma." value={data.descripcion_entregables} onChange={(e) => set('descripcion_entregables')(e.target.value)} disabled={disabled} />
              </Field>
            </div>
            <Field label="Tipo de tarifa">
              <select className={inputCls()} value={data.tipo_tarifa} onChange={(e) => set('tipo_tarifa')(e.target.value)} disabled={disabled}>
                {TIPOS_TARIFA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Forma de pago">
              <select className={inputCls()} value={data.forma_pago} onChange={(e) => set('forma_pago')(e.target.value)} disabled={disabled}>
                {FORMAS_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Monto de la tarifa" error={errors.monto_tarifa}>
              <input type="number" min="0" className={inputCls(errors.monto_tarifa)} placeholder="4500" value={data.monto_tarifa} onChange={(e) => set('monto_tarifa')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Moneda">
              <select className={inputCls()} value={data.moneda} onChange={(e) => set('moneda')(e.target.value)} disabled={disabled}>
                {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className="animate-step grid gap-5 sm:grid-cols-2">
            <Field label="Fecha de inicio" error={errors.fecha_inicio}>
              <input type="date" className={inputCls(errors.fecha_inicio)} value={data.fecha_inicio} onChange={(e) => set('fecha_inicio')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Fecha de fin estimada" error={errors.fecha_fin_estimada}>
              <input type="date" className={inputCls(errors.fecha_fin_estimada)} value={data.fecha_fin_estimada} onChange={(e) => set('fecha_fin_estimada')(e.target.value)} disabled={disabled} />
            </Field>
            <Field label="Propiedad intelectual">
              <select className={inputCls()} value={data.propiedad_intelectual} onChange={(e) => set('propiedad_intelectual')(e.target.value)} disabled={disabled}>
                {PROPIEDAD_OPTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Cláusula de rescisión (días)" hint="Entre 1 y 365" error={errors.clausula_rescision_dias}>
              <input type="number" min="1" max="365" className={inputCls(errors.clausula_rescision_dias)} placeholder="15" value={data.clausula_rescision_dias} onChange={(e) => set('clausula_rescision_dias')(e.target.value)} disabled={disabled} />
            </Field>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
        <button
          onClick={goBack}
          disabled={step === 0 || disabled}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handlePreview} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            <Eye className="h-4 w-4" /> Vista previa
          </button>
        )}
      </div>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

/* ─── Helpers ─── */

function inputCls(error) {
  return `w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 ${
    error ? 'border-destructive' : 'border-input'
  }`
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-foreground">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  )
}

function Clause({ title, children }) {
  return (
    <section className="mt-6">
      <h4 className="font-display text-base text-foreground">{title}</h4>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </section>
  )
}
