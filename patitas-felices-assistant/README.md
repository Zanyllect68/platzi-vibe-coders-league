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

---

## 📁 Estructura del proyecto

```
proyecto 1/
├── app/                   # App Router (páginas, layout, API)
│   ├── api/chat/          # Endpoint de streaming del chat
│   ├── globals.css        # Estilos globales (Tailwind + tema)
│   ├── layout.tsx         # Layout raíz (dark mode, fuentes)
│   └── page.tsx           # Página principal → PatyChat
├── components/            # Componentes React
│   ├── chat/              # Header, Empty, Message, PatyChat
│   └── ui/                # button (shadcn)
├── lib/                   # system-prompt.ts, utils.ts
├── public/                # Íconos, logos, placeholders
├── .env.local             # ← secrets (NO se commitea)
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
```

---

## 🚀 Empezar

### 1. Instalar dependencias

```bash
cd "proyecto 1"
npm install
```

### 2. Variables de entorno

Crea `proyecto 1/.env.local`:

```env
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_API_KEY=tu_api_key_aqui
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
```

> 🔑 Regístrate gratis en [build.nvidia.com](https://build.nvidia.com) para obtener tu API key.

### 3. Desarrollo

```bash
cd "proyecto 1"
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 🌐 Despliegue en Vercel

1. Sube este repo a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Configura **Root Directory**: `proyecto 1`
4. Agrega las variables de entorno en **Settings → Environment Variables**:
   - `NVIDIA_BASE_URL`
   - `NVIDIA_API_KEY`
   - `NVIDIA_MODEL`
5. Deploy

> ⚠️ **Nunca** commitees `.env.local` ni subas la API key al repositorio. `.gitignore` ya lo excluye por defecto.

---

## 🤖 Personalidad del asistente

**Nombre:** Paty
**Tono:** Semi-formal, cercana, empática. Trata de "tú".
**Idioma:** Español colombiano.
**Límite:** Solo responde desde la base de conocimiento. Si no sabe algo, deriva al equipo humano.

El prompt completo está en `proyecto 1/lib/system-prompt.ts`.

---

## 📚 Documentación

- Documentación académica y notas del proyecto universitario en [`../docs/`](../docs/)

---

🐾 **Regla de oro:** El asistente nunca inventa información. Si no sabe algo, lo dice honestamente y deriva al equipo humano.