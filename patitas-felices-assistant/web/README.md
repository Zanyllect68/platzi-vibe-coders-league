# 🐾 Patitas Felices — Asistente Virtual

> **"Donde tu mascota siempre es familia"**
> Chatbot de atención al cliente para una veterinaria y pet shop en Medellín, impulsado por IA.

Una interfaz conversacional moderna para responder preguntas de clientes sobre servicios, precios, ubicaciones, horarios y promociones — todo desde una base de conocimiento curada.

---

## 🐾 Stack

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16 (App Router, Turbopack) |
| **Lenguaje** | TypeScript, React 19 |
| **Estilos** | Tailwind CSS 4 + shadcn/ui |
| **IA** | Llama 3.1 8B Instruct vía NVIDIA NIM |
| **SDK** | AI SDK v5 + `@ai-sdk/openai-compatible` |
| **Iconos** | Lucide React |
| **Fuentes** | Nunito + Nunito Sans (vía `next/font`) |

## 📁 Estructura

```
proyecto 1/
├── app/                      # App Router (páginas, layout, API)
│   ├── api/chat/             # Endpoint de streaming del chat
│   ├── globals.css           # Estilos globales (Tailwind + tema)
│   ├── layout.tsx            # Layout raíz (dark mode, fuentes)
│   └── page.tsx              # Página principal → PatyChat
├── components/               # Componentes React
│   ├── chat/                 # Header, Empty, Message, PatyChat
│   └── ui/                   # button (shadcn)
├── lib/                      # system-prompt.ts, utils.ts
├── public/                   # Íconos, logos, placeholders
├── .env.local                # ← secrets (NO se commitea)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## 🚀 Empezar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crea `.env.local`:

```env
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_API_KEY=tu_api_key_aqui
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

> 🔑 Regístrate gratis en [build.nvidia.com](https://build.nvidia.com) para obtener tu API key.

### 3. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 🌐 Despliegue en Vercel

1. Sube el repo a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Configura **Root Directory**: `proyecto 1`
4. Agrega las variables de entorno en **Settings → Environment Variables**
5. Deploy

> ⚠️ **Nunca** commitees `.env.local` ni subas tu API key. `.gitignore` ya lo excluye por defecto.

## 🤖 Personalidad del asistente

- **Nombre:** Paty
- **Tono:** Semi-formal, cercana, empática. Trata de "tú".
- **Idioma:** Español colombiano.
- **Límite:** Solo responde desde su base de conocimiento. Si no sabe algo, deriva al equipo humano.

El prompt completo está en [`lib/system-prompt.ts`](./lib/system-prompt.ts).

---

🐾 **Regla de oro:** El asistente nunca inventa información. Si no sabe algo, lo dice honestamente.