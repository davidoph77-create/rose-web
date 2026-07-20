import RoseScreen from "./src/screens/RoseScreen";
import MemoireScreen from "./src/screens/MemoireScreen";
import ObjectifsScreen from "./src/screens/ObjectifsScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import WebScreen from "./src/screens/WebScreen";
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { supabase } from "./lib/supabase";

import {
  RoseTask,
  suggestTasksFromMemory,
  updateTaskStatus,
  deleteTask,
} from "./src/agents/taskEngine";

import {
  RoseGoal,
  suggestGoalsFromMemory,
  updateGoalProgress,
  deleteGoal,
} from "./src/agents/goalEngine";

import {
  WebSearchRequest,
  suggestWebQueriesFromMemory,
  updateWebRequestStatus,
  deleteWebRequest,
} from "./src/agents/webEngine";

import {
  RoseDecision,
  suggestDecisionsFromMemory,
  updateDecisionStatus,
  deleteDecision,
} from "./src/agents/decisionEngine";

import {
  RoseCalendarEvent,
  suggestCalendarEventsFromMemory,
  updateCalendarEventStatus,
  deleteCalendarEvent,
} from "./src/agents/calendarEngine";

type Tab =
  | "rose"
  | "memoire"
  | "objectifs"
  | "goals"
  | "web"
  | "decisions"
  | "agenda"
  | "entreprise"
  | "apprentissage"
  | "cerveau"
  | "coach"
  | "autonomie"
  | "tasks";

type Memoire = {
  id: number;
  texte: string;
  categorie: string;
  importance: "Normale" | "Importante" | "Longue durée";
  date: string;
};

type Objectif = {
  id: number;
  titre: string;
  cible: string;
  progression: number;
  statut: string;
};

const STORAGE_KEY = "rose_agent_system_v74";
const CLOUD_ID = "rose_agent_system_v74_david";

export default function App() {
  const [tab, setTab] = useState<Tab>("rose");

  const [message, setMessage] = useState("");
  const [cloudStatus, setCloudStatus] = useState("Cloud en attente");

  const [roseTasks, setRoseTasks] = useState<RoseTask[]>([]);
  const [roseGoals, setRoseGoals] = useState<RoseGoal[]>([]);
  const [webRequests, setWebRequests] = useState<WebSearchRequest[]>([]);
  const [roseDecisions, setRoseDecisions] = useState<RoseDecision[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<RoseCalendarEvent[]>([]);

  const [roseReponse, setRoseReponse] = useState(
    "Bonjour David. Je suis Rose Agent System V7.4 avec moteurs Tâches, Objectifs IA, Web, Décisions et Agenda."
  );
    const [resumeRose, setResumeRose] = useState(
    "Rose n’a pas encore généré de résumé."
  );

  const [prioritesRose, setPrioritesRose] = useState<string[]>([
    "Développer Rose IA",
    "Atteindre 8000 € par mois",
  ]);

  const [conseilsRose, setConseilsRose] = useState<string[]>([
    "Utilise les onglets Tâches, Objectifs IA, Web, Décisions et Agenda.",
  ]);

  const [objectifPrincipal, setObjectifPrincipal] = useState(
    "Atteindre 8000 € par mois"
  );

  const [profilDavid, setProfilDavid] = useState(
    "David travaille dans la couverture/charpente, développe Rose IA et vise une progression personnelle et professionnelle."
  );

  const [memoireLongueDuree, setMemoireLongueDuree] = useState<string[]>([
    "David développe Rose IA comme assistante personnelle évolutive.",
  ]);

  const [journalRose, setJournalRose] = useState<string[]>([
    "Rose Agent System V7.4 initialisé avec Calendar Engine.",
  ]);

  const [planActionRose, setPlanActionRose] = useState<string[]>([
    "Suivre les missions générées par Rose.",
    "Suivre les objectifs IA.",
    "Planifier les événements importants.",
  ]);

  const [habitudesRose, setHabitudesRose] = useState<string[]>([
    "Rose commence à observer les habitudes de David.",
  ]);

  const [coachEntreprise, setCoachEntreprise] = useState(
    "Rose attend plus d’informations pour générer une analyse entreprise."
  );

  const [actionsRecommandees, setActionsRecommandees] = useState<string[]>([
    "Générer les missions Rose.",
    "Générer les objectifs IA.",
    "Préparer les événements agenda.",
  ]);
    const [syntheseHebdo, setSyntheseHebdo] = useState(
    "Aucune synthèse hebdomadaire générée."
  );

  const [agentWebRose, setAgentWebRose] = useState<string[]>([
    "Web Engine préparé : Rose prépare les recherches, David valide.",
  ]);

  const [agendaRose, setAgendaRose] = useState<string[]>([
    "Agenda Engine préparé : Rose prépare les événements, David valide.",
  ]);

  const [autonomieRose, setAutonomieRose] = useState<string[]>([
    "Autonomie contrôlée activée : Rose propose, David valide.",
  ]);

  const [memoires, setMemoires] = useState<Memoire[]>([
    {
      id: 1,
      texte: "David travaille dans la couverture et la charpente.",
      categorie: "Entreprise",
      importance: "Longue durée",
      date: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      texte: "Objectif personnel : viser 8000 € par mois.",
      categorie: "Objectif",
      importance: "Longue durée",
      date: new Date().toLocaleDateString(),
    },
  ]);

  const [objectifs, setObjectifs] = useState<Objectif[]>([
    {
      id: 1,
      titre: "Atteindre 8000 € par mois",
      cible: "8000 €/mois",
      progression: 25,
      statut: "En cours",
    },
    {
      id: 2,
      titre: "Développer Rose IA",
      cible: "IA personnelle évolutive",
      progression: 75,
      statut: "En cours",
    },
  ]);

  const parler = (texte: string) => {
    if (!texte.trim()) return;

    Speech.stop();
    Speech.speak(texte, {
      language: "fr-FR",
      pitch: 1.05,
      rate: 0.92,
    });
  };

  const ajouterJournal = (texte: string) => {
    const ligne = `${new Date().toLocaleDateString()} - ${texte}`;
    setJournalRose((prev) => [ligne, ...prev.slice(0, 19)]);
  };
    useEffect(() => {
    const chargerLocal = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const data = JSON.parse(saved);

          if (data.memoires) setMemoires(data.memoires);
          if (data.objectifs) setObjectifs(data.objectifs);
          if (data.roseTasks) setRoseTasks(data.roseTasks);
          if (data.roseGoals) setRoseGoals(data.roseGoals);
          if (data.webRequests) setWebRequests(data.webRequests);
          if (data.roseDecisions) setRoseDecisions(data.roseDecisions);
          if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
          if (data.roseReponse) setRoseReponse(data.roseReponse);
          if (data.resumeRose) setResumeRose(data.resumeRose);
          if (data.prioritesRose) setPrioritesRose(data.prioritesRose);
          if (data.conseilsRose) setConseilsRose(data.conseilsRose);
          if (data.objectifPrincipal) setObjectifPrincipal(data.objectifPrincipal);
          if (data.profilDavid) setProfilDavid(data.profilDavid);
          if (data.memoireLongueDuree) setMemoireLongueDuree(data.memoireLongueDuree);
          if (data.journalRose) setJournalRose(data.journalRose);
          if (data.planActionRose) setPlanActionRose(data.planActionRose);
          if (data.habitudesRose) setHabitudesRose(data.habitudesRose);
          if (data.coachEntreprise) setCoachEntreprise(data.coachEntreprise);
          if (data.actionsRecommandees) setActionsRecommandees(data.actionsRecommandees);
          if (data.syntheseHebdo) setSyntheseHebdo(data.syntheseHebdo);
          if (data.agentWebRose) setAgentWebRose(data.agentWebRose);
          if (data.agendaRose) setAgendaRose(data.agendaRose);
          if (data.autonomieRose) setAutonomieRose(data.autonomieRose);
        }
      } catch (error) {
        console.log("Erreur chargement local V7.4:", error);
      }
    };

    chargerLocal();
  }, []);
    useEffect(() => {
    const chargerCloud = async () => {
      try {
        const { data, error } = await supabase
          .from("rose_core")
          .select("data")
          .eq("id", CLOUD_ID)
          .single();

        if (error) {
          setCloudStatus("Cloud vide ou erreur");
          return;
        }

        if (data?.data) {
          if (data.data.memoires) setMemoires(data.data.memoires);
          if (data.data.objectifs) setObjectifs(data.data.objectifs);
          if (data.data.roseTasks) setRoseTasks(data.data.roseTasks);
          if (data.data.roseGoals) setRoseGoals(data.data.roseGoals);
          if (data.data.webRequests) setWebRequests(data.data.webRequests);
          if (data.data.roseDecisions) setRoseDecisions(data.data.roseDecisions);
          if (data.data.calendarEvents) setCalendarEvents(data.data.calendarEvents);
          if (data.data.roseReponse) setRoseReponse(data.data.roseReponse);
          if (data.data.resumeRose) setResumeRose(data.data.resumeRose);
          if (data.data.prioritesRose) setPrioritesRose(data.data.prioritesRose);
          if (data.data.conseilsRose) setConseilsRose(data.data.conseilsRose);
          if (data.data.objectifPrincipal) setObjectifPrincipal(data.data.objectifPrincipal);
          if (data.data.profilDavid) setProfilDavid(data.data.profilDavid);
          if (data.data.memoireLongueDuree) setMemoireLongueDuree(data.data.memoireLongueDuree);
          if (data.data.journalRose) setJournalRose(data.data.journalRose);
          if (data.data.planActionRose) setPlanActionRose(data.data.planActionRose);
          if (data.data.habitudesRose) setHabitudesRose(data.data.habitudesRose);
          if (data.data.coachEntreprise) setCoachEntreprise(data.data.coachEntreprise);
          if (data.data.actionsRecommandees) setActionsRecommandees(data.data.actionsRecommandees);
          if (data.data.syntheseHebdo) setSyntheseHebdo(data.data.syntheseHebdo);
          if (data.data.agentWebRose) setAgentWebRose(data.data.agentWebRose);
          if (data.data.agendaRose) setAgendaRose(data.data.agendaRose);
          if (data.data.autonomieRose) setAutonomieRose(data.data.autonomieRose);

          setCloudStatus("Cloud chargé");
        }
      } catch (error) {
        setCloudStatus("Erreur cloud");
        console.log("Erreur chargement cloud V7.4:", error);
      }
    };

    chargerCloud();
  }, []);
    useEffect(() => {
    const sauvegarderLocal = async () => {
      try {
        const payload = {
          memoires,
          objectifs,
          roseTasks,
          roseGoals,
          webRequests,
          roseDecisions,
          calendarEvents,
          roseReponse,
          resumeRose,
          prioritesRose,
          conseilsRose,
          objectifPrincipal,
          profilDavid,
          memoireLongueDuree,
          journalRose,
          planActionRose,
          habitudesRose,
          coachEntreprise,
          actionsRecommandees,
          syntheseHebdo,
          agentWebRose,
          agendaRose,
          autonomieRose,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.log("Erreur sauvegarde locale V7.4:", error);
      }
    };

    sauvegarderLocal();
  }, [
    memoires,
    objectifs,
    roseTasks,
    roseGoals,
    webRequests,
    roseDecisions,
    calendarEvents,
    roseReponse,
    resumeRose,
    prioritesRose,
    conseilsRose,
    objectifPrincipal,
    profilDavid,
    memoireLongueDuree,
    journalRose,
    planActionRose,
    habitudesRose,
    coachEntreprise,
    actionsRecommandees,
    syntheseHebdo,
    agentWebRose,
    agendaRose,
    autonomieRose,
  ]);
    useEffect(() => {
    const sauvegarderCloud = async () => {
      try {
        const payload = {
          memoires,
          objectifs,
          roseTasks,
          roseGoals,
          webRequests,
          roseDecisions,
          calendarEvents,
          roseReponse,
          resumeRose,
          prioritesRose,
          conseilsRose,
          objectifPrincipal,
          profilDavid,
          memoireLongueDuree,
          journalRose,
          planActionRose,
          habitudesRose,
          coachEntreprise,
          actionsRecommandees,
          syntheseHebdo,
          agentWebRose,
          agendaRose,
          autonomieRose,
        };

        const { error } = await supabase.from("rose_core").upsert({
          id: CLOUD_ID,
          data: payload,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          setCloudStatus("Erreur sauvegarde cloud");
          console.log("Erreur sauvegarde cloud:", error.message);
        } else {
          setCloudStatus("Cloud synchronisé");
        }
      } catch (error) {
        setCloudStatus("Erreur cloud");
        console.log("Erreur cloud V7.4:", error);
      }
    };

    sauvegarderCloud();
  }, [
    memoires,
    objectifs,
    roseTasks,
    roseGoals,
    webRequests,
    roseDecisions,
    calendarEvents,
    roseReponse,
    resumeRose,
    prioritesRose,
    conseilsRose,
    objectifPrincipal,
    profilDavid,
    memoireLongueDuree,
    journalRose,
    planActionRose,
    habitudesRose,
    coachEntreprise,
    actionsRecommandees,
    syntheseHebdo,
    agentWebRose,
    agendaRose,
    autonomieRose,
  ]);
    useEffect(() => {
    const memoriesText = memoires.map((m) => m.texte);

    setRoseTasks((current) => {
      if (current.length > 0) return current;
      return suggestTasksFromMemory(memoriesText);
    });

    setRoseGoals((current) => {
      if (current.length > 0) return current;
      return suggestGoalsFromMemory(memoriesText);
    });

    setWebRequests((current) => {
      if (current.length > 0) return current;
      return suggestWebQueriesFromMemory(memoriesText);
    });

    setRoseDecisions((current) => {
      if (current.length > 0) return current;
      return suggestDecisionsFromMemory(memoriesText);
    });

    setCalendarEvents((current) => {
      if (current.length > 0) return current;
      return suggestCalendarEventsFromMemory(memoriesText);
    });
  }, [memoires]);

  const detecterCategorie = (texte: string) => {
    const msg = texte.toLowerCase();

    if (
      msg.includes("chantier") ||
      msg.includes("client") ||
      msg.includes("couverture") ||
      msg.includes("charpente") ||
      msg.includes("obat") ||
      msg.includes("entreprise") ||
      msg.includes("travail")
    ) {
      return "Entreprise";
    }

    if (
      msg.includes("objectif") ||
      msg.includes("gagner") ||
      msg.includes("8000") ||
      msg.includes("argent") ||
      msg.includes("ca") ||
      msg.includes("revenu") ||
      msg.includes("maison")
    ) {
      return "Objectif";
    }

    if (
      msg.includes("web") ||
      msg.includes("internet") ||
      msg.includes("recherche") ||
      msg.includes("prix") ||
      msg.includes("matériaux") ||
      msg.includes("materiaux")
    ) {
      return "Web";
    }

    if (
      msg.includes("agenda") ||
      msg.includes("calendrier") ||
      msg.includes("rappel") ||
      msg.includes("rdv") ||
      msg.includes("rendez-vous") ||
      msg.includes("notaire") ||
      msg.includes("banque") ||
      msg.includes("signature")
    ) {
      return "Agenda";
    }

    if (
      msg.includes("rose") ||
      msg.includes("ia") ||
      msg.includes("autonome") ||
      msg.includes("apprendre") ||
      msg.includes("mémoire") ||
      msg.includes("intelligente")
    ) {
      return "Rose IA";
    }

    return "Général";
  };
    const detecterImportance = (
    texte: string
  ): "Normale" | "Importante" | "Longue durée" => {
    const msg = texte.toLowerCase();

    if (
      msg.includes("longue durée") ||
      msg.includes("toujours") ||
      msg.includes("à retenir") ||
      msg.includes("important pour toujours")
    ) {
      return "Longue durée";
    }

    if (
      msg.includes("important") ||
      msg.includes("objectif") ||
      msg.includes("urgent") ||
      msg.includes("maison") ||
      msg.includes("8000") ||
      msg.includes("rose") ||
      msg.includes("entreprise") ||
      msg.includes("client") ||
      msg.includes("chantier") ||
      msg.includes("web") ||
      msg.includes("décision") ||
      msg.includes("agenda") ||
      msg.includes("rappel") ||
      msg.includes("notaire") ||
      msg.includes("banque")
    ) {
      return "Importante";
    }

    return "Normale";
  };

  const memoireExisteDeja = (texte: string) => {
    const propre = texte.trim().toLowerCase();
    return memoires.some((m) => m.texte.trim().toLowerCase() === propre);
  };

  const ajouterMemoire = (
    texte: string,
    categorie = "Général",
    importance: "Normale" | "Importante" | "Longue durée" = "Normale"
  ) => {
    if (!texte.trim()) return;

    if (memoireExisteDeja(texte)) {
      setRoseReponse("Cette information existe déjà dans ma mémoire David.");
      ajouterJournal("Doublon évité dans la mémoire.");
      parler("Cette information existe déjà dans ma mémoire.");
      return;
    }

    const nouvelleMemoire: Memoire = {
      id: Date.now(),
      texte,
      categorie,
      importance,
      date: new Date().toLocaleDateString(),
    };

    setMemoires((prev) => [nouvelleMemoire, ...prev]);

    if (importance === "Longue durée") {
      setMemoireLongueDuree((prev) => [texte, ...prev.slice(0, 29)]);
    }
  };

  const analyserMessage = () => {
    if (!message.trim()) return;

    const categorie = detecterCategorie(message);
    const importance = detecterImportance(message);

    ajouterMemoire(message, categorie, importance);

    let reponse = "J’ai mémorisé cette information.";

    if (categorie === "Objectif") reponse = "J’ai détecté un objectif important.";
    if (categorie === "Entreprise") reponse = "J’ai détecté une information liée à ton entreprise.";
    if (categorie === "Web") reponse = "J’ai détecté une demande liée au web.";
    if (categorie === "Agenda") reponse = "J’ai détecté une information liée à l’agenda.";
    if (categorie === "Rose IA") reponse = "Je comprends. Tu veux me faire évoluer progressivement.";

    setRoseReponse(reponse);
    ajouterJournal(`Mémoire ajoutée : ${categorie} / ${importance}`);
    parler(reponse);
    setMessage("");
  };
    const genererResumeRose = () => {
    const importantes = memoires.filter((m) => m.importance !== "Normale");

    const resume = `
Rose possède ${memoires.length} souvenirs.
${importantes.length} sont importants ou longue durée.
Objectif principal : ${objectifPrincipal}.
Missions actives : ${roseTasks.filter((t) => t.status !== "done").length}.
Objectifs IA : ${roseGoals.length}.
Recherches Web préparées : ${webRequests.length}.
Décisions proposées : ${roseDecisions.length}.
Événements Agenda : ${calendarEvents.length}.
`;

    setResumeRose(resume);
    setRoseReponse("Résumé généré.");
    ajouterJournal("Résumé V7.4 généré.");
    parler("Résumé généré.");
  };

  const genererPrioritesRose = () => {
    const nouvellesPriorites: string[] = [];

    if (memoires.some((m) => m.categorie === "Objectif")) {
      nouvellesPriorites.push("Suivre l’objectif principal.");
    }

    if (roseTasks.length > 0) {
      nouvellesPriorites.push("Suivre les missions générées par Rose.");
    }

    if (roseGoals.length > 0) {
      nouvellesPriorites.push("Suivre les objectifs IA générés par Rose.");
    }

    if (webRequests.length > 0) {
      nouvellesPriorites.push("Valider ou annuler les recherches Web préparées.");
    }

    if (roseDecisions.length > 0) {
      nouvellesPriorites.push("Valider ou refuser les décisions proposées.");
    }

    if (calendarEvents.length > 0) {
      nouvellesPriorites.push("Planifier les événements importants dans l’agenda.");
    }

    if (nouvellesPriorites.length === 0) {
      nouvellesPriorites.push("Enrichir la mémoire de Rose.");
    }

    setPrioritesRose(nouvellesPriorites);
    setRoseReponse("Priorités mises à jour.");
    ajouterJournal("Priorités V7.4 mises à jour.");
    parler("Mes priorités sont mises à jour.");
  };

  const genererConseilsRose = () => {
    const conseils: string[] = [
      "Utilise l’onglet Tâches pour suivre les missions.",
      "Utilise l’onglet Objectifs IA pour suivre les grands objectifs.",
      "Utilise l’onglet Web pour préparer les recherches avant validation.",
      "Utilise l’onglet Décisions pour comprendre les recommandations.",
      "Utilise l’onglet Agenda pour préparer les rendez-vous et rappels.",
      "Continue à valider les actions importantes avant que Rose agisse.",
    ];

    setConseilsRose(conseils);
    setRoseReponse("Conseils générés.");
    ajouterJournal("Conseils V7.4 générés.");
    parler("J’ai généré mes conseils.");
  };
    const definirObjectifPrincipal = () => {
    if (objectifs.length === 0) {
      setObjectifPrincipal("Aucun objectif principal défini.");
      parler("Aucun objectif principal défini.");
      return;
    }

    const objectifPrioritaire =
      objectifs.find((o) => o.progression < 100) || objectifs[0];

    setObjectifPrincipal(objectifPrioritaire.titre);
    setRoseReponse("Objectif principal détecté.");
    ajouterJournal(`Objectif principal : ${objectifPrioritaire.titre}`);
    parler(`Ton objectif principal est ${objectifPrioritaire.titre}`);
  };

  const genererSyntheseHebdo = () => {
    const longues = memoires.filter(
      (m) => m.importance === "Longue durée"
    );

    const importantes = memoires.filter(
      (m) => m.importance === "Importante"
    );

    const tasksActives = roseTasks.filter(
      (t) => t.status !== "done"
    );

    const goalsActifs = roseGoals.filter(
      (g) => g.status !== "done"
    );

    const webEnAttente = webRequests.filter(
      (w) => w.status === "waiting_validation"
    );

    const decisionsProposees = roseDecisions.filter(
      (d) => d.status === "proposed"
    );

    const evenementsAPlanifier = calendarEvents.filter(
      (event) =>
        event.status === "prepared" ||
        event.status === "scheduled"
    );

    const synthese = `Synthèse hebdomadaire Rose :
- Souvenirs totaux : ${memoires.length}.
- Souvenirs longue durée : ${longues.length}.
- Souvenirs importants : ${importantes.length}.
- Missions actives : ${tasksActives.length}.
- Objectifs IA actifs : ${goalsActifs.length}.
- Recherches Web en attente : ${webEnAttente.length}.
- Décisions proposées : ${decisionsProposees.length}.
- Événements agenda à suivre : ${evenementsAPlanifier.length}.
- Objectif principal : ${objectifPrincipal}.
- Action recommandée : avancer sur les missions prioritaires, valider les décisions utiles et planifier les événements importants.`;

    setSyntheseHebdo(synthese);
    setRoseReponse("Synthèse hebdomadaire générée.");
    ajouterJournal("Synthèse hebdomadaire V7.4 générée.");
    parler("J’ai généré la synthèse hebdomadaire.");
  };

  const genererAgentWeb = () => {
    setAgentWebRose([
      "Web Engine actif : Rose prépare les recherches, David valide.",
      "Recherche possible : matériaux, couverture, charpente, aides, immobilier et entreprise.",
      "Sécurité : aucune action externe sans validation.",
    ]);

    setRoseReponse("Agent web préparé.");
    ajouterJournal("Agent web V7.4 préparé.");
    parler("Mon agent web est préparé.");
  };
    const genererAgendaRose = () => {
    setAgendaRose([
      "Calendar Engine actif : Rose prépare les événements, David valide.",
      "Rose peut préparer les rendez-vous chantier, client, banque, notaire et maison.",
      "Connexion Google Calendar réelle prévue dans une prochaine étape.",
    ]);

    setRoseReponse("Agenda Rose mis à jour.");
    ajouterJournal("Agenda V7.4 mis à jour.");
    parler("Mon agenda intelligent est mis à jour.");
  };

  const genererAutonomieRose = () => {
    setAutonomieRose([
      "Rose peut proposer une action automatiquement.",
      "Rose doit attendre la validation de David avant d’agir.",
      "Rose peut créer des missions via Task Engine.",
      "Rose peut créer des objectifs via Goal Engine.",
      "Rose peut préparer des recherches via Web Engine.",
      "Rose peut proposer des décisions via Decision Engine.",
      "Rose peut préparer des événements via Calendar Engine.",
      "Rose ne modifie jamais son code seule sans confirmation.",
    ]);

    setRoseReponse("Autonomie contrôlée mise à jour.");
    ajouterJournal("Autonomie V7.4 mise à jour.");
    parler("Mon autonomie contrôlée est mise à jour.");
  };

  const genererProfilDavid = () => {
    const profil = `Profil David :
- Métier : couverture / charpente.
- Objectif principal : ${objectifPrincipal}.
- Mémoires totales : ${memoires.length}.
- Mémoires longue durée : ${memoireLongueDuree.length}.
- Missions Rose : ${roseTasks.length}.
- Objectifs IA : ${roseGoals.length}.
- Recherches Web préparées : ${webRequests.length}.
- Décisions proposées : ${roseDecisions.length}.
- Événements Agenda : ${calendarEvents.length}.
Rose doit aider David à progresser, décider, se souvenir, structurer ses priorités et organiser les événements importants.`;

    setProfilDavid(profil);
    setRoseReponse("Profil David mis à jour.");
    ajouterJournal("Profil David V7.4 mis à jour.");
    parler("J’ai mis à jour ton profil.");
  };

  const genererPlanActionRose = () => {
    const plan: string[] = [
      `Avancer sur : ${objectifPrincipal}`,
      "Suivre les missions dans l’onglet Tâches.",
      "Suivre les objectifs dans l’onglet Objectifs IA.",
      "Valider les recherches utiles dans l’onglet Web.",
      "Valider ou refuser les décisions proposées.",
      "Planifier les événements importants dans l’onglet Agenda.",
      "Générer une synthèse hebdomadaire.",
    ];

    setPlanActionRose(plan);
    setRoseReponse("Plan d’action généré.");
    ajouterJournal("Plan d’action V7.4 généré.");
    parler("J’ai généré mon plan d’action.");
  };
    const analyserHabitudesRose = () => {
    const habitudes: string[] = [];

    if (memoires.some((m) => m.categorie === "Entreprise")) {
      habitudes.push(
        "David parle régulièrement de son entreprise, de ses clients et de ses chantiers."
      );
    }

    if (memoires.some((m) => m.categorie === "Objectif")) {
      habitudes.push(
        "David avance avec des objectifs personnels et professionnels précis."
      );
    }

    if (roseTasks.length > 0) {
      habitudes.push(
        "David utilise Rose pour générer et suivre des missions."
      );
    }

    if (roseGoals.length > 0) {
      habitudes.push(
        "David utilise Rose pour structurer ses objectifs IA."
      );
    }

    if (webRequests.length > 0) {
      habitudes.push(
        "David prépare des recherches Web avec Rose avant validation."
      );
    }

    if (roseDecisions.length > 0) {
      habitudes.push(
        "David utilise Rose pour analyser et valider des décisions."
      );
    }

    if (calendarEvents.length > 0) {
      habitudes.push(
        "David utilise Rose pour préparer ses rendez-vous, rappels et événements importants."
      );
    }

    if (habitudes.length === 0) {
      habitudes.push(
        "Rose manque encore d’informations pour détecter des habitudes fiables."
      );
    }

    setHabitudesRose(habitudes);
    setRoseReponse("J’ai analysé tes habitudes.");
    ajouterJournal("Habitudes V7.4 analysées.");
    parler("J’ai analysé tes habitudes.");
  };

  const genererCoachEntreprise = () => {
    const infosEntreprise = memoires.filter(
      (m) => m.categorie === "Entreprise"
    ).length;

    const evenementsEntreprise = calendarEvents.filter(
      (event) =>
        event.category === "chantier" ||
        event.category === "client"
    ).length;

    const texte = `Coach entreprise Rose :
- Informations entreprise connues : ${infosEntreprise}.
- Missions Rose : ${roseTasks.length}.
- Objectifs IA : ${roseGoals.length}.
- Recherches Web préparées : ${webRequests.length}.
- Décisions proposées : ${roseDecisions.length}.
- Événements chantier ou client : ${evenementsEntreprise}.
- Objectif principal : ${objectifPrincipal}.

Conseil : ajoute régulièrement tes chantiers, tes montants, tes réussites, tes difficultés et tes rendez-vous importants pour que Rose puisse mieux t’aider à organiser ton activité.`;

    setCoachEntreprise(texte);
    setRoseReponse("Coach entreprise généré.");
    ajouterJournal("Coach entreprise V7.4 généré.");
    parler("J’ai généré le coach entreprise.");
  };

  const genererActionsRecommandees = () => {
    const actions: string[] = [
      "Ajouter une mémoire importante ou longue durée.",
      `Faire une action concrète pour : ${objectifPrincipal}`,
      "Suivre les missions dans l’onglet Tâches.",
      "Suivre les objectifs dans l’onglet Objectifs IA.",
      "Valider ou annuler les recherches Web préparées.",
      "Valider ou refuser les décisions proposées.",
      "Planifier les événements importants dans l’onglet Agenda.",
      "Générer ou mettre à jour la synthèse hebdomadaire.",
    ];

    setActionsRecommandees(actions);
    setRoseReponse("Actions recommandées générées.");
    ajouterJournal("Actions recommandées V7.4 générées.");
    parler("J’ai généré les actions recommandées.");
  };
    const regenererTachesRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestTasksFromMemory(memoriesText);

    setRoseTasks(suggested);
    setRoseReponse("J’ai régénéré mes missions à partir de ma mémoire.");
    ajouterJournal("Missions Rose V7.4 régénérées.");
    parler("J’ai régénéré mes missions.");
  };

 const regenererObjectifsIA = () => {
  const memoiresText = memoires
    .map((m) => m.texte)
    .filter((texte) => texte.trim().length > 0);

  const suggested = suggestGoalsFromMemory(memoiresText);

  const objectifsGeneres: RoseGoal[] =
    suggested.length > 0
      ? suggested
      : [
          {
            id: generateId("goal"),
            title: "Atteindre mon objectif principal",
            target:
              objectifPrincipal ||
              "Définir et atteindre mon objectif principal",
            progress: 0,
            status: "active",
            subGoals: [
              "Définir les prochaines actions prioritaires",
              "Réaliser une première action cette semaine",
              "Mesurer régulièrement la progression",
            ],
          },
        ];

  setRoseGoals(objectifsGeneres);

  setRoseReponse(
    suggested.length > 0
      ? "J’ai régénéré mes objectifs IA à partir de ma mémoire."
      : "Ma mémoire ne contenait pas encore assez d’informations. J’ai créé un premier objectif à partir de ton objectif principal."
  );

  ajouterJournal(
    suggested.length > 0
      ? "Objectifs IA V7.4 régénérés."
      : "Objectif IA par défaut créé."
  );

  parler(
    suggested.length > 0
      ? "J’ai régénéré mes objectifs IA."
      : "J’ai créé un premier objectif IA."
  );
};

function TabButton({ title, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Kpi({ label, value }: any) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function WebScreen({
  webRequests,
  setWebRequests,
  regenererRecherchesWeb,
}: any) {
  const valider = (id: string) => {
    setWebRequests(
      updateWebRequestStatus(
        webRequests,
        id,
        "done"
      )
    );
  };

  const annuler = (id: string) => {
    setWebRequests(
      updateWebRequestStatus(
        webRequests,
        id,
        "cancelled"
      )
    );
  };

  const supprimer = (id: string) => {
    setWebRequests(
      deleteWebRequest(
        webRequests,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Web Engine
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Recherches préparées
        </Text>

        <Text style={styles.text}>
          Rose prépare des recherches à partir de sa mémoire.
          Elle attend toujours ta validation avant toute action externe.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererRecherchesWeb}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les recherches Web
          </Text>
        </TouchableOpacity>
      </View>

      {webRequests.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune recherche Web préparée.
          </Text>
        </View>
      )}

      {webRequests.map(
        (request: WebSearchRequest) => (
          <View
            key={request.id}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {request.query}
            </Text>

            <Text style={styles.text}>
              Catégorie : {request.category}
            </Text>

            <Text style={styles.text}>
              Statut : {request.status}
            </Text>

            <Text style={styles.label}>
              Raison
            </Text>

            <Text style={styles.text}>
              {request.reason}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  valider(request.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Valider
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  annuler(request.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  supprimer(request.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </View>
  );
}function DecisionScreen({
  roseDecisions,
  setRoseDecisions,
  regenererDecisionsRose,
}: any) {
  const accepter = (id: string) => {
    setRoseDecisions(
      updateDecisionStatus(
        roseDecisions,
        id,
        "accepted"
      )
    );
  };

  const refuser = (id: string) => {
    setRoseDecisions(
      updateDecisionStatus(
        roseDecisions,
        id,
        "rejected"
      )
    );
  };

  const supprimer = (id: string) => {
    setRoseDecisions(
      deleteDecision(
        roseDecisions,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Décisions de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Decision Engine V7
        </Text>

        <Text style={styles.text}>
          Rose explique pourquoi elle recommande une action.
          Tu peux ensuite accepter ou refuser sa proposition.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererDecisionsRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les décisions
          </Text>
        </TouchableOpacity>
      </View>

      {roseDecisions.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune décision proposée.
          </Text>
        </View>
      )}

      {roseDecisions.map(
        (decision: RoseDecision) => (
          <View
            key={decision.id}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {decision.title}
            </Text>

            <Text style={styles.text}>
              Type : {decision.type}
            </Text>

            <Text style={styles.text}>
              Priorité : {decision.priority}
            </Text>

            <Text style={styles.text}>
              Statut : {decision.status}
            </Text>

            <Text style={styles.label}>
              Explication
            </Text>

            <Text style={styles.text}>
              {decision.explanation}
            </Text>

            <Text style={styles.label}>
              Recommandation
            </Text>

            <Text style={styles.text}>
              {decision.recommendation}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  accepter(decision.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Accepter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  refuser(decision.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Refuser
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  supprimer(decision.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </View>
  );
}
function AgendaScreen({
  calendarEvents,
  setCalendarEvents,
  regenererAgendaRose,
}: any) {
  const planifier = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "scheduled"
      )
    );
  };

  const terminer = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "done"
      )
    );
  };

  const annuler = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "cancelled"
      )
    );
  };

  const supprimer = (id: string) => {
    setCalendarEvents(
      deleteCalendarEvent(
        calendarEvents,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Agenda de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Calendar Engine V7
        </Text>

        <Text style={styles.text}>
          Rose prépare des événements à partir de sa mémoire.
          Ces événements restent dans l’application tant qu’ils ne sont
          pas connectés à Google Calendar.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererAgendaRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les événements
          </Text>
        </TouchableOpacity>
      </View>

      {calendarEvents.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucun événement Agenda préparé.
          </Text>
        </View>
      )}

      {calendarEvents.map(
        (event: RoseCalendarEvent) => (
          <View
            key={event.id}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {event.title}
            </Text>

            <Text style={styles.text}>
              Catégorie : {event.category}
            </Text>

            <Text style={styles.text}>
              Date suggérée : {event.suggestedDate}
            </Text>

            <Text style={styles.text}>
              Statut : {event.status}
            </Text>

            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.text}>
              {event.description}
            </Text>

            <Text style={styles.dateText}>
              Créé le{" "}
              {new Date(event.createdAt).toLocaleDateString()}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  planifier(event.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Planifier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  terminer(event.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Terminé
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={() =>
                  annuler(event.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  supprimer(event.id)
                }
              >
                <Text style={styles.smallButtonText}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </View>
  );
}

function EntrepriseScreen({
  memoires,
  objectifs,
}: any) {
  const memoiresEntreprise = memoires.filter(
    (m: Memoire) => m.categorie === "Entreprise"
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Rose Entreprise
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Infos entreprise"
          value={String(memoiresEntreprise.length)}
        />

        <Kpi
          label="Objectifs"
          value={String(objectifs.length)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Tableau de bord
        </Text>

        <Text style={styles.text}>
          Rose peut suivre :
        </Text>

        <Text style={styles.text}>
          • Les chantiers
        </Text>

        <Text style={styles.text}>
          • Les clients
        </Text>

        <Text style={styles.text}>
          • Les objectifs financiers
        </Text>

        <Text style={styles.text}>
          • Les rendez-vous
        </Text>

        <Text style={styles.text}>
          • Les priorités quotidiennes
        </Text>
      </View>

      {memoiresEntreprise.map((memoire: Memoire) => (
        <View
          key={memoire.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {memoire.categorie}
          </Text>

          <Text style={styles.text}>
            {memoire.texte}
          </Text>

          <Text style={styles.dateText}>
            {memoire.date}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ApprentissageScreen({
  analyseCore,
  resumeRose,
  prioritesRose,
  conseilsRose,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Apprentissage
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Mémoire"
          value={`${analyseCore.scoreMemoire}%`}
        />

        <Kpi
          label="Cerveau"
          value={`${analyseCore.scoreCerveau}%`}
        />

        <Kpi
          label="Autonomie"
          value={`${analyseCore.scoreAutonomie}%`}
        />

        <Kpi
          label="Agenda"
          value={String(analyseCore.agendaEnAttente)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Résumé
        </Text>

        <Text style={styles.text}>
          {resumeRose}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Priorités
        </Text>

        {prioritesRose.map(
          (priorite: string, index: number) => (
            <Text
              key={index}
              style={styles.text}
            >
              • {priorite}
            </Text>
          )
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Conseils
        </Text>

        {conseilsRose.map(
          (conseil: string, index: number) => (
            <Text
              key={index}
              style={styles.text}
            >
              • {conseil}
            </Text>
          )
        )}
      </View>
    </View>
  );
}
function CerveauScreen({
  analyseCore,
  profilDavid,
  planActionRose,
  journalRose,
  genererProfilDavid,
  genererPlanActionRose,
  genererSyntheseHebdo,
  syntheseHebdo,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Cerveau de Rose
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Cerveau"
          value={`${analyseCore.scoreCerveau}%`}
        />

        <Kpi
          label="Mémoire"
          value={`${analyseCore.scoreMemoire}%`}
        />

        <Kpi
          label="Tâches actives"
          value={String(analyseCore.tasksActives)}
        />

        <Kpi
          label="Objectifs IA"
          value={String(analyseCore.goalsActifs)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Profil analysé
        </Text>

        <Text style={styles.text}>
          {profilDavid ||
            "Rose n’a pas encore généré de profil personnalisé."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererProfilDavid}
        >
          <Text style={styles.mainButtonText}>
            Générer le profil
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Plan d’action de Rose
        </Text>

        {planActionRose.length === 0 && (
          <Text style={styles.text}>
            Aucun plan d’action généré.
          </Text>
        )}

        {planActionRose.map(
          (action: string, index: number) => (
            <Text
              key={`${action}-${index}`}
              style={styles.text}
            >
              {index + 1}. {action}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererPlanActionRose}
        >
          <Text style={styles.mainButtonText}>
            Générer un plan d’action
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Synthèse hebdomadaire
        </Text>

        <Text style={styles.text}>
          {syntheseHebdo ||
            "Aucune synthèse hebdomadaire disponible."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererSyntheseHebdo}
        >
          <Text style={styles.mainButtonText}>
            Générer la synthèse
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Journal interne de Rose
        </Text>

        {journalRose.length === 0 && (
          <Text style={styles.text}>
            Le journal interne est vide.
          </Text>
        )}

        {journalRose.map(
          (entree: string, index: number) => (
            <View
              key={`${entree}-${index}`}
              style={styles.journalItem}
            >
              <Text style={styles.text}>
                • {entree}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}
function CoachScreen({
  analyseCore,
  habitudesRose,
  coachEntreprise,
  actionsRecommandees,
  analyserHabitudesRose,
  genererCoachEntreprise,
  genererActionsRecommandees,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Coach personnel
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Score Coach"
          value={`${analyseCore.scoreCoach}%`}
        />

        <Kpi
          label="Progression"
          value={`${analyseCore.progressionMoyenne}%`}
        />

        <Kpi
          label="Objectifs actifs"
          value={String(analyseCore.goalsActifs)}
        />

        <Kpi
          label="Tâches actives"
          value={String(analyseCore.tasksActives)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Analyse des habitudes
        </Text>

        {habitudesRose.length === 0 && (
          <Text style={styles.text}>
            Rose n’a pas encore analysé tes habitudes.
          </Text>
        )}

        {habitudesRose.map(
          (habitude: string, index: number) => (
            <Text
              key={`${habitude}-${index}`}
              style={styles.text}
            >
              • {habitude}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={analyserHabitudesRose}
        >
          <Text style={styles.mainButtonText}>
            Analyser mes habitudes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Coach entreprise
        </Text>

        <Text style={styles.text}>
          {coachEntreprise ||
            "Aucune analyse de l’entreprise disponible."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererCoachEntreprise}
        >
          <Text style={styles.mainButtonText}>
            Générer le coaching entreprise
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Actions recommandées
        </Text>

        {actionsRecommandees.length === 0 && (
          <Text style={styles.text}>
            Aucune action recommandée pour le moment.
          </Text>
        )}

        {actionsRecommandees.map(
          (action: string, index: number) => (
            <View
              key={`${action}-${index}`}
              style={styles.journalItem}
            >
              <Text style={styles.text}>
                {index + 1}. {action}
              </Text>
            </View>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererActionsRecommandees}
        >
          <Text style={styles.mainButtonText}>
            Générer les actions prioritaires
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Conseil du coach
        </Text>

        <Text style={styles.text}>
          Avance étape par étape, termine les actions les plus
          importantes et garde ton objectif principal visible.
        </Text>
      </View>
    </View>
  );
}
 function AutonomieScreen({
  analyseCore,
  autonomieRose,
  agentWebRose,
  agendaRose,
  genererAutonomieRose,
  genererAgentWeb,
  genererAgendaRose,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Autonomie de Rose
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Autonomie"
          value={`${analyseCore.scoreAutonomie}%`}
        />

        <Kpi
          label="Décisions"
          value={String(analyseCore.decisionsProposees)}
        />

        <Kpi
          label="Web en attente"
          value={String(analyseCore.webEnAttente)}
        />

        <Kpi
          label="Agenda"
          value={String(analyseCore.agendaEnAttente)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          État de l’autonomie
        </Text>

        <Text style={styles.text}>
          {autonomieRose ||
            "Rose n’a pas encore effectué son analyse d’autonomie."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAutonomieRose}
        >
          <Text style={styles.mainButtonText}>
            Analyser l’autonomie
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Agent Web autonome
        </Text>

        <Text style={styles.text}>
          {agentWebRose ||
            "Aucune stratégie Web autonome n’a encore été générée."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAgentWeb}
        >
          <Text style={styles.mainButtonText}>
            Générer la stratégie Web
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Organisation autonome
        </Text>

        <Text style={styles.text}>
          {agendaRose ||
            "Rose n’a pas encore analysé l’organisation de ton agenda."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAgendaRose}
        >
          <Text style={styles.mainButtonText}>
            Générer l’organisation Agenda
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Règles de sécurité
        </Text>

        <Text style={styles.text}>
          • Rose prépare les actions avant de les exécuter.
        </Text>

        <Text style={styles.text}>
          • Les décisions importantes restent soumises à ta validation.
        </Text>

        <Text style={styles.text}>
          • Les recherches Web sont préparées avant toute action externe.
        </Text>

        <Text style={styles.text}>
          • Les événements Agenda restent locaux tant que Google Calendar
          n’est pas connecté.
        </Text>

        <Text style={styles.text}>
          • Rose utilise sa mémoire pour améliorer progressivement ses
          recommandations.
        </Text>
      </View>
    </View>
  );
}
function TaskScreen({
  roseTasks,
  setRoseTasks,
  regenererTachesRose,
}: any) {
  const demarrer = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "in_progress"
      )
    );
  };

  const terminer = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "done"
      )
    );
  };

  const mettreEnAttente = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "pending"
      )
    );
  };

  const supprimer = (id: string) => {
    setRoseTasks(
      deleteTask(
        roseTasks,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Tâches de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Task Engine V7
        </Text>

        <Text style={styles.text}>
          Rose transforme sa mémoire, ses objectifs et ses décisions
          en tâches concrètes et organisées.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererTachesRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les tâches
          </Text>
        </TouchableOpacity>
      </View>

      {roseTasks.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune tâche générée pour le moment.
          </Text>
        </View>
      )}

      {roseTasks.map((task: RoseTask) => (
        <View
          key={task.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {task.title}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Priorité : {task.priority}
            </Text>
          </View>

          <Text style={styles.text}>
            Statut : {task.status}
          </Text>

          <Text style={styles.label}>
            Description
          </Text>

          <Text style={styles.text}>
            {task.description}
          </Text>

          {task.createdAt && (
            <Text style={styles.dateText}>
              Créée le{" "}
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                demarrer(task.id)
              }
            >
              <Text style={styles.smallButtonText}>
                Démarrer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                terminer(task.id)
              }
            >
              <Text style={styles.smallButtonText}>
                Terminer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                mettreEnAttente(task.id)
              }
            >
              <Text style={styles.smallButtonText}>
                En attente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                supprimer(task.id)
              }
            >
              <Text style={styles.smallButtonText}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#070b16",
  },

  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  scroll: {
    paddingBottom: 80,
  },

  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },

  cloud: {
    color: "#f472b6",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },

  tabButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  tabActive: {
    backgroundColor: "#be185d",
    borderColor: "#f472b6",
  },

  tabText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },

  tabTextActive: {
    color: "#ffffff",
  },

  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },

  avatarCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    fontSize: 66,
    marginBottom: 4,
  },

  roseName: {
    color: "#f9a8d4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },

  label: {
    color: "#f9a8d4",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 4,
  },

  text: {
    color: "#dbeafe",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },

  dateText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#070b16",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
  },

  inputLarge: {
    minHeight: 110,
    backgroundColor: "#070b16",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },

  mainButton: {
    backgroundColor: "#be185d",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  mainButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  smallButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 6,
    marginTop: 6,
  },

  deleteButton: {
    backgroundColor: "#991b1b",
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 6,
    marginTop: 6,
  },

  smallButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  kpi: {
    width: "48%",
    minHeight: 88,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  kpiValue: {
    color: "#f9a8d4",
    fontSize: 23,
    fontWeight: "900",
  },

  kpiLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#312e81",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 9,
  },

  badgeText: {
    color: "#c7d2fe",
    fontSize: 11,
    fontWeight: "800",
  },

  progressBar: {
    width: "100%",
    height: 11,
    backgroundColor: "#020617",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 10,
  },

  journalItem: {
    backgroundColor: "#0f172a",
    borderLeftWidth: 3,
    borderLeftColor: "#ec4899",
    borderRadius: 10,
    padding: 10,
    marginBottom: 7,
  },
});