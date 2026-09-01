import RoseScreen from "./src/screens/RoseScreen";
import { createRoseAppHook, formatRoseV10AppResponse } from "./src/core/v10/app_hook";
import MemoireScreen from "./src/screens/MemoireScreen";
import ObjectifsScreen from "./src/screens/ObjectifsScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import WebScreen from "./src/screens/WebScreen";
import DecisionScreen from "./src/screens/DecisionScreen";
import AgendaScreen from "./src/screens/AgendaScreen";
import EntrepriseScreen from "./src/screens/EntrepriseScreen";
import ApprentissageScreen from "./src/screens/ApprentissageScreen";
import CerveauScreen from "./src/screens/CerveauScreen";
import CoachScreen from "./src/screens/CoachScreen";
import AutonomieScreen from "./src/screens/AutonomieScreen";
import TaskScreen from "./src/screens/TaskScreen";
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
} from "./src/agents/webEngine";

import {
  RoseDecision,
  suggestDecisionsFromMemory,
} from "./src/agents/decisionEngine";

import {
  RoseCalendarEvent,
  suggestCalendarEventsFromMemory,
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

  // Rose V10-012C - Controlled V10 Activation
  // V10 est actif pour l'analyse/routage interne uniquement.
  // Aucune autonomie ni action externe automatique n'est autorisÃ©e.
  // En cas d'erreur, le hook retombe automatiquement sur V7.4.
  const roseAppHook = useMemo(
    () =>
      createRoseAppHook(
        async () => {
          analyserMessageLegacy();
          return { handledBy: "legacy" };
        },
        {
          enabled: true,
          fallbackToLegacy: true,
          enableAutonomy: false,
        }
      ),
    [message]
  );

  const analyserMessage = async () => {
    if (!message.trim()) return;

    const messageEnvoye = message;

    const result = await roseAppHook.run({
      message: messageEnvoye,
      metadata: {
        source: "RoseScreen",
        appVersion: "V10-012C",
        autonomyEnabled: false,
        externalActionsAllowed: false,
      },
    });

    console.log(
      `[Rose V10-012C] mode=${result.mode}`,
      result.v10Error ? `fallback=${result.v10Error}` : ""
    );

    // En mode V10, on conserve les comportements sÃ»rs de l'app :
    // mÃ©morisation locale/cloud, journal, TTS et remise Ã  zÃ©ro du champ.
    if (result.mode === "v10") {
      const categorie = detecterCategorie(messageEnvoye);
      const importance = detecterImportance(messageEnvoye);

      ajouterMemoire(
        messageEnvoye,
        categorie,
        importance
      );

      const summary =
        formatRoseV10AppResponse(
          result.value
        );

      setRoseReponse(summary.text);
      ajouterJournal(
        `V10-012C : ${summary.intent ?? "general"} / ${summary.selectedAgents.join(", ") || "aucun agent"}`
      );
      parler(summary.text);
      setMessage("");
    }
  };
  const analyserMessageLegacy = () => {
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
              id: `goal_${Date.now()}`,
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

  const regenererRecherchesWeb = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestWebQueriesFromMemory(memoriesText);

    setWebRequests(suggested);
    setRoseReponse(
      "J’ai préparé des recherches Web à partir de ma mémoire."
    );
    ajouterJournal("Recherches Web V7.4 préparées.");
    parler("J’ai préparé les recherches Web.");
  };

  const regenererDecisionsRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestDecisionsFromMemory(memoriesText);

    setRoseDecisions(suggested);
    setRoseReponse(
      "J’ai régénéré mes décisions à partir de ma mémoire."
    );
    ajouterJournal("Décisions Rose V7.4 régénérées.");
    parler("J’ai régénéré mes décisions.");
  };

  const regenererAgendaRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestCalendarEventsFromMemory(memoriesText);

    setCalendarEvents(suggested);
    setRoseReponse(
      "J’ai préparé les événements Agenda à partir de ma mémoire."
    );
    ajouterJournal("Événements Agenda V7.4 préparés.");
    parler("J’ai préparé les événements de l’agenda.");
  };

  const analyseCore = useMemo(() => {
    const totalMemoires = memoires.length;

    const memoiresEntreprise = memoires.filter(
      (m) => m.categorie === "Entreprise"
    ).length;

    const memoiresObjectifs = memoires.filter(
      (m) => m.categorie === "Objectif"
    ).length;

    const memoiresWeb = memoires.filter(
      (m) => m.categorie === "Web"
    ).length;

    const memoiresAgenda = memoires.filter(
      (m) => m.categorie === "Agenda"
    ).length;

    const memoiresLongueDureeCount = memoires.filter(
      (m) => m.importance === "Longue durée"
    ).length;

    const progressionMoyenne =
      objectifs.length === 0
        ? 0
        : Math.round(
            objectifs.reduce((s, o) => s + o.progression, 0) /
              objectifs.length
          );

    const tasksActives = roseTasks.filter(
      (task) => task.status !== "done"
    ).length;

    const goalsActifs = roseGoals.filter(
      (goal) => goal.status !== "done"
    ).length;

    const webEnAttente = webRequests.filter(
      (request) => request.status === "waiting_validation"
    ).length;

    const decisionsProposees = roseDecisions.filter(
      (decision) => decision.status === "proposed"
    ).length;

    const agendaEnAttente = calendarEvents.filter(
      (event) =>
        event.status === "prepared" ||
        event.status === "scheduled"
    ).length;

    const scoreMemoire = Math.min(
      100,
      totalMemoires * 5 +
        memoiresLongueDureeCount * 8
    );

    const scoreCerveau = Math.min(
      100,
      scoreMemoire +
        objectifs.length * 8 +
        roseGoals.length * 8 +
        roseDecisions.length * 5 +
        calendarEvents.length * 4
    );

    const scoreAutonomie = Math.min(
      100,
      scoreCerveau +
        tasksActives * 5 +
        goalsActifs * 5 +
        webEnAttente * 4 +
        decisionsProposees * 4 +
        agendaEnAttente * 4
    );

    const scoreCoach = Math.min(
      100,
      scoreCerveau +
        habitudesRose.length * 5 +
        actionsRecommandees.length * 4
    );

    return {
      totalMemoires,
      memoiresEntreprise,
      memoiresObjectifs,
      memoiresWeb,
      memoiresAgenda,
      memoiresLongueDureeCount,
      progressionMoyenne,
      tasksActives,
      goalsActifs,
      webEnAttente,
      decisionsProposees,
      agendaEnAttente,
      scoreMemoire,
      scoreCerveau,
      scoreAutonomie,
      scoreCoach,
    };
  }, [
    memoires,
    objectifs,
    roseTasks,
    roseGoals,
    webRequests,
    roseDecisions,
    calendarEvents,
    habitudesRose,
    actionsRecommandees,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.title}>Rose Agent System V7.4</Text>

        <Text style={styles.subtitle}>
          Mémoire • Tâches • Objectifs IA • Web • Décisions • Agenda
        </Text>

        <Text style={styles.cloud}>{cloudStatus}</Text>

        <View style={styles.tabs}>
          <TabButton
            title="Rose"
            active={tab === "rose"}
            onPress={() => setTab("rose")}
          />

          <TabButton
            title="Mémoire"
            active={tab === "memoire"}
            onPress={() => setTab("memoire")}
          />

          <TabButton
            title="Objectifs"
            active={tab === "objectifs"}
            onPress={() => setTab("objectifs")}
          />

          <TabButton
            title="Objectifs IA"
            active={tab === "goals"}
            onPress={() => setTab("goals")}
          />

          <TabButton
            title="Web"
            active={tab === "web"}
            onPress={() => setTab("web")}
          />

          <TabButton
            title="Décisions"
            active={tab === "decisions"}
            onPress={() => setTab("decisions")}
          />

          <TabButton
            title="Agenda"
            active={tab === "agenda"}
            onPress={() => setTab("agenda")}
          />

          <TabButton
            title="Entreprise"
            active={tab === "entreprise"}
            onPress={() => setTab("entreprise")}
          />

          <TabButton
            title="Apprentissage"
            active={tab === "apprentissage"}
            onPress={() => setTab("apprentissage")}
          />

          <TabButton
            title="Cerveau"
            active={tab === "cerveau"}
            onPress={() => setTab("cerveau")}
          />

          <TabButton
            title="Coach"
            active={tab === "coach"}
            onPress={() => setTab("coach")}
          />

          <TabButton
            title="Autonomie"
            active={tab === "autonomie"}
            onPress={() => setTab("autonomie")}
          />

          <TabButton
            title="Tâches"
            active={tab === "tasks"}
            onPress={() => setTab("tasks")}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {tab === "rose" && (
            <RoseScreen
              message={message}
              setMessage={setMessage}
              roseReponse={roseReponse}
              analyserMessage={analyserMessage}
              parler={parler}
              analyseCore={analyseCore}
              resumeRose={resumeRose}
              prioritesRose={prioritesRose}
              conseilsRose={conseilsRose}
              objectifPrincipal={objectifPrincipal}
              genererResumeRose={genererResumeRose}
              genererPrioritesRose={genererPrioritesRose}
              genererConseilsRose={genererConseilsRose}
              definirObjectifPrincipal={definirObjectifPrincipal}
            />
          )}

          {tab === "memoire" && (
            <MemoireScreen
              memoires={memoires}
              setMemoires={setMemoires}
              memoireLongueDuree={memoireLongueDuree}
            />
          )}

          {tab === "objectifs" && (
            <ObjectifsScreen
              objectifs={objectifs}
              setObjectifs={setObjectifs}
            />
          )}

          {tab === "goals" && (
            <GoalsScreen
              roseGoals={roseGoals}
              setRoseGoals={setRoseGoals}
              regenererObjectifsIA={regenererObjectifsIA}
            />
          )}

          {tab === "web" && (
            <WebScreen
              webRequests={webRequests}
              setWebRequests={setWebRequests}
              regenererRecherchesWeb={regenererRecherchesWeb}
            />
          )}

          {tab === "decisions" && (
            <DecisionScreen
              roseDecisions={roseDecisions}
              setRoseDecisions={setRoseDecisions}
              regenererDecisionsRose={regenererDecisionsRose}
            />
          )}

          {tab === "agenda" && (
            <AgendaScreen
              calendarEvents={calendarEvents}
              setCalendarEvents={setCalendarEvents}
              regenererAgendaRose={regenererAgendaRose}
            />
          )}

          {tab === "entreprise" && (
            <EntrepriseScreen
              memoires={memoires}
              objectifs={objectifs}
            />
          )}

          {tab === "apprentissage" && (
            <ApprentissageScreen
              analyseCore={analyseCore}
              memoires={memoires}
              resumeRose={resumeRose}
              prioritesRose={prioritesRose}
              conseilsRose={conseilsRose}
              objectifPrincipal={objectifPrincipal}
            />
          )}

          {tab === "cerveau" && (
            <CerveauScreen
              analyseCore={analyseCore}
              profilDavid={profilDavid}
              planActionRose={planActionRose}
              journalRose={journalRose}
              genererProfilDavid={genererProfilDavid}
              genererPlanActionRose={genererPlanActionRose}
              genererSyntheseHebdo={genererSyntheseHebdo}
              syntheseHebdo={syntheseHebdo}
            />
          )}

          {tab === "coach" && (
            <CoachScreen
              analyseCore={analyseCore}
              habitudesRose={habitudesRose}
              coachEntreprise={coachEntreprise}
              actionsRecommandees={actionsRecommandees}
              analyserHabitudesRose={analyserHabitudesRose}
              genererCoachEntreprise={genererCoachEntreprise}
              genererActionsRecommandees={genererActionsRecommandees}
            />
          )}

          {tab === "autonomie" && (
            <AutonomieScreen
              analyseCore={analyseCore}
              autonomieRose={autonomieRose}
              agentWebRose={agentWebRose}
              agendaRose={agendaRose}
              genererAutonomieRose={genererAutonomieRose}
              genererAgentWeb={genererAgentWeb}
              genererAgendaRose={genererAgendaRose}
            />
          )}

          {tab === "tasks" && (
            <TaskScreen
              roseTasks={roseTasks}
              setRoseTasks={setRoseTasks}
              regenererTachesRose={regenererTachesRose}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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