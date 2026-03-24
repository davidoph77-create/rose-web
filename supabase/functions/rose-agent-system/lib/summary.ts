import { ConversationSummary, Intent, ChatMessage } from "./types.ts";
import { normalizeText, truncate, uniqueArray } from "./utils.ts";

export function summarizeConversation(
  message: string,
  history: ChatMessage[] = [],
  intent: Intent,
): ConversationSummary {
  const recentUserMessages = history
    .filter((m) => m.role === "user")
    .slice(-4)
    .map((m) => m.content);

  const combined = [...recentUserMessages, message].join(" ");
  const text = normalizeText(combined);

  const key_points: string[] = [];
  const user_needs: string[] = [];

  if (/rose/.test(text)) key_points.push("Le sujet principal concerne Rose.");
  if (/multi agent|multi agents|orchestrateur|agent/.test(text)) {
    key_points.push("La conversation concerne un système multi-agents.");
  }
  if (/memoire|souviens toi|retient|garde en memoire/.test(text)) {
    key_points.push("La mémoire est un point important.");
  }
  if (/tache|todo|agenda|planning|calendrier/.test(text)) {
    key_points.push("L'utilisateur veut une base prête pour les tâches ou le calendrier.");
  }
  if (/projet|application|code|fonction/.test(text)) {
    key_points.push("Le besoin est lié au développement technique du projet.");
  }

  switch (intent) {
    case "project":
      user_needs.push("Obtenir une architecture puissante, propre et extensible.");
      break;
    case "self_improvement":
      user_needs.push("Faire évoluer Rose vers une version plus autonome.");
      break;
    case "task":
      user_needs.push("Transformer la demande en action concrète.");
      break;
    case "calendar":
      user_needs.push("Organiser un élément de planning.");
      break;
    case "memory":
      user_needs.push("Conserver une information importante pour plus tard.");
      break;
    case "search":
      user_needs.push("Trouver des informations utiles.");
      break;
    default:
      user_needs.push("Recevoir une réponse claire, utile et chaleureuse.");
      break;
  }

  return {
    short_summary: truncate(
      `Conversation centrée sur ${
        intent === "project" ? "le développement du système Rose" : "la demande de l'utilisateur"
      } avec priorité à la clarté, la mémoire et l'évolution du système.`,
      220,
    ),
    key_points: uniqueArray(key_points).slice(0, 5),
    user_needs: uniqueArray(user_needs).slice(0, 5),
  };
}