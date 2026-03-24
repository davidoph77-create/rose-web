import { Intent } from "./types.ts";
import { normalizeText } from "./utils.ts";

export function detectIntent(message: string): Intent {
  const text = normalizeText(message);

  // urgence / sécurité
  if (
    /suicide|mourir|me faire du mal|envie d en finir|je veux disparaitre|urgence|danger/.test(
      text,
    )
  ) {
    return "emergency";
  }

  // mémoire explicite
  if (
    /souviens toi|n oublie pas|garde en memoire|retiens que|memorise|mémorise/.test(
      text,
    )
  ) {
    return "memory";
  }

  // calendrier / agenda
  if (
    /agenda|calendrier|planning|rendez vous|rendez-vous|rdv|evenement|événement|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|heure|date/.test(
      text,
    )
  ) {
    return "calendar";
  }

  // tâches
  if (
    /tache|tâche|todo|a faire|à faire|checklist|mission|liste des choses a faire|liste des choses à faire/.test(
      text,
    )
  ) {
    return "task";
  }

  // recherche web / infos externes
  if (
    /cherche|recherche|internet|web|google|trouve moi|infos|information|actualites|actualités|news/.test(
      text,
    )
  ) {
    return "search";
  }

  // auto-amélioration / évolution de Rose
  if (
    /ameliore rose|améliore rose|faire evoluer rose|faire évoluer rose|ameliore ton systeme|améliore ton système|auto amelioration|auto-amelioration|auto amélioration|self improvement|self-improvement/.test(
      text,
    )
  ) {
    return "self_improvement";
  }

  // projet / architecture / roadmap / système IA
  if (
    /projet|architecture|roadmap|systeme ia|système ia|ia complete|ia complète|ameliore mon systeme|améliore mon système|ameliore completement|améliore complètement|ameliorer mon projet|améliorer mon projet|faire avancer mon projet|faire evoluer mon projet|faire évoluer mon projet|plan complet|plan d architecture|plan d'architecture/.test(
      text,
    )
  ) {
    return "project";
  }

  // suivi d'objectif
  if (
    /objectif|but|progression|avancement|jalon|suivi|road to|roadto|etape suivante|étape suivante/.test(
      text,
    )
  ) {
    return "goal_tracking";
  }

  return "chat";
}