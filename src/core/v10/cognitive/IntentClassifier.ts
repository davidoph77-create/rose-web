import {
  CognitiveDecision,
  CognitiveInput,
  CognitiveIntent,
} from "./CognitiveTypes";

export class IntentClassifier {
  classify(
    input: CognitiveInput
  ): CognitiveDecision {
    const text = input.message
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const matches: Array<{
      intent: CognitiveIntent;
      score: number;
      capability: string;
      reason: string;
    }> = [];

    this.pushIf(
      matches,
      text,
      ["souviens", "memoire", "rappelle", "historique"],
      "memory",
      "memory",
      "La demande concerne la mémoire."
    );

    this.pushIf(
      matches,
      text,
      ["plan", "organise", "objectif", "etapes", "priorite"],
      "planning",
      "planning",
      "La demande demande de planifier ou prioriser."
    );

    this.pushIf(
      matches,
      text,
      ["agenda", "calendrier", "rendez-vous", "rdv", "demain"],
      "calendar",
      "calendar",
      "La demande concerne l'agenda."
    );

    this.pushIf(
      matches,
      text,
      ["entreprise", "chantier", "client", "devis", "facture"],
      "business",
      "business",
      "La demande concerne l'entreprise."
    );

    this.pushIf(
      matches,
      text,
      ["parle", "voix", "micro", "ecoute", "tts"],
      "voice",
      "voice",
      "La demande concerne la voix."
    );

    this.pushIf(
      matches,
      text,
      ["web", "internet", "cherche", "recherche", "site"],
      "web",
      "web",
      "La demande nécessite potentiellement le Web."
    );

    if (matches.length === 0) {
      return {
        intent: "general",
        confidence: 0.55,
        selectedCapabilities: ["general"],
        reasons: [
          "Aucune intention spécialisée forte n'a été détectée.",
        ],
        requiresValidation: false,
      };
    }

    matches.sort((a, b) => b.score - a.score);
    const best = matches[0];

    const capabilities = Array.from(
      new Set(
        matches
          .filter((item) => item.score >= best.score - 1)
          .map((item) => item.capability)
      )
    );

    return {
      intent: best.intent,
      confidence: Math.min(0.95, 0.65 + best.score * 0.08),
      selectedCapabilities: capabilities,
      reasons: matches
        .filter((item) => capabilities.includes(item.capability))
        .map((item) => item.reason),
      requiresValidation:
        best.intent === "calendar" ||
        best.intent === "business",
    };
  }

  private pushIf(
    target: Array<any>,
    text: string,
    terms: string[],
    intent: CognitiveIntent,
    capability: string,
    reason: string
  ) {
    const score = terms.reduce(
      (total, term) =>
        total + (text.includes(term) ? 1 : 0),
      0
    );

    if (score > 0) {
      target.push({
        intent,
        score,
        capability,
        reason,
      });
    }
  }
}
