import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const baseURL = process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1"
  const apiKey = process.env.NVIDIA_API_KEY
  const modelId = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct"

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Falta la variable NVIDIA_API_KEY en .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  const nvidia = createOpenAICompatible({
    name: "nvidia",
    apiKey,
    baseURL,
  })

  const result = streamText({
    model: nvidia.chatModel(modelId),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    temperature: 0.5,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
