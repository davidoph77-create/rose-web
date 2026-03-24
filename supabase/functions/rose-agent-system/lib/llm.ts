import { ChatMessage } from "./types.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

export async function callLLM(params: {
  system: string;
  history?: ChatMessage[];
  user: string;
}): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "Je suis là pour toi. J’ai analysé ta demande avec mon système Rose multi-agents, mais OPENAI_API_KEY n’est pas encore configurée.";
  }

  try {
    const messages = [
      { role: "system", content: params.system },
      ...(params.history ?? []).slice(-12),
      { role: "user", content: params.user },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur callLLM:", errorText);
      return "Je n’ai pas pu produire une réponse enrichie pour le moment, mais mon système Rose continue de fonctionner.";
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content ??
      "Je n’ai pas pu générer une réponse complète.";
  } catch (error) {
    console.error("Exception callLLM:", error);
    return "Une erreur est survenue pendant la génération de ma réponse.";
  }
}