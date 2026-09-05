import RoseScreen from "./src/screens/RoseScreen";
import { createRoseAppHook, formatRoseV10AppResponse } from "./src/core/v10/app_hook";
import { recordApprovalRequest } from "./src/core/v10/approval_ui";
import { answerGoogleCalendarQuestion } from "./src/core/v10/calendar_assistant";
import {
  createCalendarConversationContext,
  prepareCalendarConversationQuery,
  updateCalendarConversationContext,
  formatCalendarConversationDiagnostic,
} from "./src/core/v10/calendar_conversation";
import { validateCalendarResponse } from "./src/core/v10/calendar_response_validation";
import { classifyCalendarQueryPriority } from "./src/core/v10/calendar_query_priority";
import { classifyCalendarReadHardRoute } from "./src/core/v10/calendar_read_hard_route";
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
import ApprovalScreen from "./src/screens/ApprovalScreen";
import ExecutionQueueScreen from "./src/screens/ExecutionQueueScreen";
import EvidenceLedgerScreen from "./src/screens/EvidenceLedgerScreen";
import AuditHistoryScreen from "./src/screens/AuditHistoryScreen";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  | "tasks"
  | "approvals"
  | "executionQueue"
  | "evidence"
  | "auditHistory";

type Memoire = {
  id: number;
  texte: string;
  categorie: string;
  importance: "Normale" | "Importante" | "Longue durÃ©e";
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

  const calendarConversationRef = useRef(
    createCalendarConversationContext()
  );

  const [message, setMessage] = useState("");
  const [cloudStatus, setCloudStatus] = useState("Cloud en attente");

  const [roseTasks, setRoseTasks] = useState<RoseTask[]>([]);
  const [roseGoals, setRoseGoals] = useState<RoseGoal[]>([]);
  const [webRequests, setWebRequests] = useState<WebSearchRequest[]>([]);
  const [roseDecisions, setRoseDecisions] = useState<RoseDecision[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<RoseCalendarEvent[]>([]);

  const [roseReponse, setRoseReponse] = useState(
    "Bonjour David. Je suis Rose Agent System V7.4 avec moteurs TÃ¢ches, Objectifs IA, Web, DÃ©cisions et Agenda."
  );
    const [resumeRose, setResumeRose] = useState(
    "Rose nâ€™a pas encore gÃ©nÃ©rÃ© de rÃ©sumÃ©."
  );

  const [prioritesRose, setPrioritesRose] = useState<string[]>([
    "DÃ©velopper Rose IA",
    "Atteindre 8000 â‚¬ par mois",
  ]);

  const [conseilsRose, setConseilsRose] = useState<string[]>([
    "Utilise les onglets TÃ¢ches, Objectifs IA, Web, DÃ©cisions et Agenda.",
  ]);

  const [objectifPrincipal, setObjectifPrincipal] = useState(
    "Atteindre 8000 â‚¬ par mois"
  );

  const [profilDavid, setProfilDavid] = useState(
    "David travaille dans la couverture/charpente, dÃ©veloppe Rose IA et vise une progression personnelle et professionnelle."
  );

  const [memoireLongueDuree, setMemoireLongueDuree] = useState<string[]>([
    "David dÃ©veloppe Rose IA comme assistante personnelle Ã©volutive.",
  ]);

  const [journalRose, setJournalRose] = useState<string[]>([
    "Rose Agent System V7.4 initialisÃ© avec Calendar Engine.",
  ]);

  const [planActionRose, setPlanActionRose] = useState<string[]>([
    "Suivre les missions gÃ©nÃ©rÃ©es par Rose.",
    "Suivre les objectifs IA.",
    "Planifier les Ã©vÃ©nements importants.",
  ]);

  const [habitudesRose, setHabitudesRose] = useState<string[]>([
    "Rose commence Ã  observer les habitudes de David.",
  ]);

  const [coachEntreprise, setCoachEntreprise] = useState(
    "Rose attend plus dâ€™informations pour gÃ©nÃ©rer une analyse entreprise."
  );

  const [actionsRecommandees, setActionsRecommandees] = useState<string[]>([
    "GÃ©nÃ©rer les missions Rose.",
    "GÃ©nÃ©rer les objectifs IA.",
    "PrÃ©parer les Ã©vÃ©nements agenda.",
  ]);
    const [syntheseHebdo, setSyntheseHebdo] = useState(
    "Aucune synthÃ¨se hebdomadaire gÃ©nÃ©rÃ©e."
  );

  const [agentWebRose, setAgentWebRose] = useState<string[]>([
    "Web Engine prÃ©parÃ© : Rose prÃ©pare les recherches, David valide.",
  ]);

  const [agendaRose, setAgendaRose] = useState<string[]>([
    "Agenda Engine prÃ©parÃ© : Rose prÃ©pare les Ã©vÃ©nements, David valide.",
  ]);

  const [autonomieRose, setAutonomieRose] = useState<string[]>([
    "Autonomie contrÃ´lÃ©e activÃ©e : Rose propose, David valide.",
  ]);

  const [memoires, setMemoires] = useState<Memoire[]>([
    {
      id: 1,
      texte: "David travaille dans la couverture et la charpente.",
      categorie: "Entreprise",
      importance: "Longue durÃ©e",
      date: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      texte: "Objectif personnel : viser 8000 â‚¬ par mois.",
      categorie: "Objectif",
      importance: "Longue durÃ©e",
      date: new Date().toLocaleDateString(),
    },
  ]);

  const [objectifs, setObjectifs] = useState<Objectif[]>([
    {
      id: 1,
      titre: "Atteindre 8000 â‚¬ par mois",
      cible: "8000 â‚¬/mois",
      progression: 25,
      statut: "En cours",
    },
    {
      id: 2,
      titre: "DÃ©velopper Rose IA",
      cible: "IA personnelle Ã©volutive",
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

          setCloudStatus("Cloud chargÃ©");
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
          setCloudStatus("Cloud synchronisÃ©");
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
      msg.includes("matÃ©riaux") ||
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
      msg.includes("mÃ©moire") ||
      msg.includes("intelligente")
    ) {
      return "Rose IA";
    }

    return "GÃ©nÃ©ral";
  };
    const detecterImportance = (
    texte: string
  ): "Normale" | "Importante" | "Longue durÃ©e" => {
    const msg = texte.toLowerCase();

    if (
      msg.includes("longue durÃ©e") ||
      msg.includes("toujours") ||
      msg.includes("Ã  retenir") ||
      msg.includes("important pour toujours")
    ) {
      return "Longue durÃ©e";
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
      msg.includes("dÃ©cision") ||
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
    categorie = "GÃ©nÃ©ral",
    importance: "Normale" | "Importante" | "Longue durÃ©e" = "Normale"
  ) => {
    if (!texte.trim()) return;

    if (memoireExisteDeja(texte)) {
      setRoseReponse("Cette information existe dÃ©jÃ  dans ma mÃ©moire David.");
      ajouterJournal("Doublon Ã©vitÃ© dans la mÃ©moire.");
      parler("Cette information existe dÃ©jÃ  dans ma mÃ©moire.");
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

    if (importance === "Longue durÃ©e") {
      setMemoireLongueDuree((prev) => [texte, ...prev.slice(0, 29)]);
    }
  };

  // Rose V10-040C - Google OAuth Android Client + Connect Button
  // V10 est actif pour l'analyse/routage interne uniquement.
  // Aucune autonomie ni action externe automatique n'est autorisÃƒÂ©e.
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

    try {
      const preparedCalendarQuery = prepareCalendarConversationQuery(
        messageEnvoye,
        calendarConversationRef.current
      );

      const hardCalendarRoute = classifyCalendarReadHardRoute(
        messageEnvoye,
        preparedCalendarQuery.query
      );

      if (hardCalendarRoute.isCalendarRead) {
        console.log(
          `[Rose V10-041J] CALENDAR READ HARD ROUTE / ${hardCalendarRoute.reason}`
        );

        const calendarAnswer = await answerGoogleCalendarQuestion(
          preparedCalendarQuery.query
        );

        if (calendarAnswer.handled) {
          calendarConversationRef.current = updateCalendarConversationContext(
            calendarConversationRef.current,
            {
              originalMessage: messageEnvoye,
              resolvedQuery: preparedCalendarQuery.query,
              intent: calendarAnswer.intent,
              eventCount: calendarAnswer.eventCount,
            }
          );

          const categorie = detecterCategorie(messageEnvoye);
          const importance = detecterImportance(messageEnvoye);

          ajouterMemoire(messageEnvoye, categorie, importance);

          const validatedCalendarResponse = validateCalendarResponse({
            originalMessage: messageEnvoye,
            resolvedQuery: preparedCalendarQuery.query,
            answerText: calendarAnswer.text,
            intent: calendarAnswer.intent,
            eventCount: calendarAnswer.eventCount,
          });

          setRoseReponse(validatedCalendarResponse.normalizedText);
          ajouterJournal(
            `V10-041J : Google Calendar READ ONLY / ${calendarAnswer.intent} / events=${calendarAnswer.eventCount} / ${validatedCalendarResponse.diagnostic} / ${formatCalendarConversationDiagnostic(preparedCalendarQuery, calendarConversationRef.current)}`
          );
          parler(validatedCalendarResponse.normalizedText);
          setMessage("");
          return;
        }

        const safeText =
          "Je reconnais une question de consultation de ton agenda, mais Google Calendar n'a pas pu fournir de réponse exploitable. Aucune création ni modification d'événement ne sera préparée.";

        setRoseReponse(safeText);
        ajouterJournal(
          `V10-041J : Calendar READ HARD ROUTE / handled=false / ${hardCalendarRoute.reason} / no-action-routing`
        );
        parler(safeText);
        setMessage("");
        console.log(
          "[Rose V10-041J] CALENDAR READ HARD ROUTE / handled=false / blocked"
        );
        return;
      }

      // Secondary compatibility guard from V10-041H.
      const calendarAnswer = await answerGoogleCalendarQuestion(
        preparedCalendarQuery.query
      );

      const calendarPriority = classifyCalendarQueryPriority(
        messageEnvoye,
        preparedCalendarQuery.query
      );

      if (calendarAnswer.handled) {
        calendarConversationRef.current = updateCalendarConversationContext(
          calendarConversationRef.current,
          {
            originalMessage: messageEnvoye,
            resolvedQuery: preparedCalendarQuery.query,
            intent: calendarAnswer.intent,
            eventCount: calendarAnswer.eventCount,
          }
        );

        const categorie = detecterCategorie(messageEnvoye);
        const importance = detecterImportance(messageEnvoye);

        ajouterMemoire(messageEnvoye, categorie, importance);

        const validatedCalendarResponse = validateCalendarResponse({
          originalMessage: messageEnvoye,
          resolvedQuery: preparedCalendarQuery.query,
          answerText: calendarAnswer.text,
          intent: calendarAnswer.intent,
          eventCount: calendarAnswer.eventCount,
        });

        setRoseReponse(validatedCalendarResponse.normalizedText);
        ajouterJournal(
          `V10-041J : Google Calendar compatibility READ / ${calendarAnswer.intent} / events=${calendarAnswer.eventCount}`
        );
        parler(validatedCalendarResponse.normalizedText);
        setMessage("");
        return;
      }

      if (calendarPriority.isReadOnlyCalendarQuery) {
        const safeText =
          "Je reconnais une question de consultation de ton agenda, mais je n'ai pas pu lire Google Calendar pour cette demande. Je ne préparerai aucune création ni modification d'événement à partir de cette question.";

        setRoseReponse(safeText);
        ajouterJournal(
          `V10-041J : Calendar READ compatibility guard / handled=false / ${calendarPriority.reason} / no-action-routing`
        );
        parler(safeText);
        setMessage("");
        console.log("[Rose V10-041J] calendar-read compatibility guard");
        return;
      }
    } catch (calendarError: any) {
      console.log(
        "[Rose V10-041J] Calendar conversation fallback:",
        calendarError?.message || calendarError
      );
    }

    const result = await roseAppHook.run({
      message: messageEnvoye,
      metadata: {
        source: "RoseScreen",
        appVersion: "V10-041J",
        autonomyEnabled: false,
        externalActionsAllowed: false,
      },
    });

    console.log(
      `[Rose V10-041J] mode=${result.mode}`,
      result.v10Error ? `fallback=${result.v10Error}` : ""
    );

    if (result.mode === "v10") {
      const categorie = detecterCategorie(messageEnvoye);
      const importance = detecterImportance(messageEnvoye);

      ajouterMemoire(
        messageEnvoye,
        categorie,
        importance
      );

      const summary = formatRoseV10AppResponse(result.value);

      if ((summary.pendingApprovalCount ?? 0) > 0) {
        await recordApprovalRequest({
          message: messageEnvoye,
          intent: summary.intent,
          agents: summary.selectedAgents,
        });
      }

      setRoseReponse(summary.text);
      ajouterJournal(
        `V10-041J : ${summary.intent ?? "general"} / approvals=${summary.pendingApprovalCount ?? 0}`
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

    let reponse = "Jâ€™ai mÃ©morisÃ© cette information.";

    if (categorie === "Objectif") reponse = "Jâ€™ai dÃ©tectÃ© un objectif important.";
    if (categorie === "Entreprise") reponse = "Jâ€™ai dÃ©tectÃ© une information liÃ©e Ã  ton entreprise.";
    if (categorie === "Web") reponse = "Jâ€™ai dÃ©tectÃ© une demande liÃ©e au web.";
    if (categorie === "Agenda") reponse = "Jâ€™ai dÃ©tectÃ© une information liÃ©e Ã  lâ€™agenda.";
    if (categorie === "Rose IA") reponse = "Je comprends. Tu veux me faire Ã©voluer progressivement.";

    setRoseReponse(reponse);
    ajouterJournal(`MÃ©moire ajoutÃ©e : ${categorie} / ${importance}`);
    parler(reponse);
    setMessage("");
  };
    const genererResumeRose = () => {
    const importantes = memoires.filter((m) => m.importance !== "Normale");

    const resume = `
Rose possÃ¨de ${memoires.length} souvenirs.
${importantes.length} sont importants ou longue durÃ©e.
Objectif principal : ${objectifPrincipal}.
Missions actives : ${roseTasks.filter((t) => t.status !== "done").length}.
Objectifs IA : ${roseGoals.length}.
Recherches Web prÃ©parÃ©es : ${webRequests.length}.
DÃ©cisions proposÃ©es : ${roseDecisions.length}.
Ã‰vÃ©nements Agenda : ${calendarEvents.length}.
`;

    setResumeRose(resume);
    setRoseReponse("RÃ©sumÃ© gÃ©nÃ©rÃ©.");
    ajouterJournal("RÃ©sumÃ© V7.4 gÃ©nÃ©rÃ©.");
    parler("RÃ©sumÃ© gÃ©nÃ©rÃ©.");
  };

  const genererPrioritesRose = () => {
    const nouvellesPriorites: string[] = [];

    if (memoires.some((m) => m.categorie === "Objectif")) {
      nouvellesPriorites.push("Suivre lâ€™objectif principal.");
    }

    if (roseTasks.length > 0) {
      nouvellesPriorites.push("Suivre les missions gÃ©nÃ©rÃ©es par Rose.");
    }

    if (roseGoals.length > 0) {
      nouvellesPriorites.push("Suivre les objectifs IA gÃ©nÃ©rÃ©s par Rose.");
    }

    if (webRequests.length > 0) {
      nouvellesPriorites.push("Valider ou annuler les recherches Web prÃ©parÃ©es.");
    }

    if (roseDecisions.length > 0) {
      nouvellesPriorites.push("Valider ou refuser les dÃ©cisions proposÃ©es.");
    }

    if (calendarEvents.length > 0) {
      nouvellesPriorites.push("Planifier les Ã©vÃ©nements importants dans lâ€™agenda.");
    }

    if (nouvellesPriorites.length === 0) {
      nouvellesPriorites.push("Enrichir la mÃ©moire de Rose.");
    }

    setPrioritesRose(nouvellesPriorites);
    setRoseReponse("PrioritÃ©s mises Ã  jour.");
    ajouterJournal("PrioritÃ©s V7.4 mises Ã  jour.");
    parler("Mes prioritÃ©s sont mises Ã  jour.");
  };

  const genererConseilsRose = () => {
    const conseils: string[] = [
      "Utilise lâ€™onglet TÃ¢ches pour suivre les missions.",
      "Utilise lâ€™onglet Objectifs IA pour suivre les grands objectifs.",
      "Utilise lâ€™onglet Web pour prÃ©parer les recherches avant validation.",
      "Utilise lâ€™onglet DÃ©cisions pour comprendre les recommandations.",
      "Utilise lâ€™onglet Agenda pour prÃ©parer les rendez-vous et rappels.",
      "Continue Ã  valider les actions importantes avant que Rose agisse.",
    ];

    setConseilsRose(conseils);
    setRoseReponse("Conseils gÃ©nÃ©rÃ©s.");
    ajouterJournal("Conseils V7.4 gÃ©nÃ©rÃ©s.");
    parler("Jâ€™ai gÃ©nÃ©rÃ© mes conseils.");
  };
    const definirObjectifPrincipal = () => {
    if (objectifs.length === 0) {
      setObjectifPrincipal("Aucun objectif principal dÃ©fini.");
      parler("Aucun objectif principal dÃ©fini.");
      return;
    }

    const objectifPrioritaire =
      objectifs.find((o) => o.progression < 100) || objectifs[0];

    setObjectifPrincipal(objectifPrioritaire.titre);
    setRoseReponse("Objectif principal dÃ©tectÃ©.");
    ajouterJournal(`Objectif principal : ${objectifPrioritaire.titre}`);
    parler(`Ton objectif principal est ${objectifPrioritaire.titre}`);
  };

  const genererSyntheseHebdo = () => {
    const longues = memoires.filter(
      (m) => m.importance === "Longue durÃ©e"
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

    const synthese = `SynthÃ¨se hebdomadaire Rose :
- Souvenirs totaux : ${memoires.length}.
- Souvenirs longue durÃ©e : ${longues.length}.
- Souvenirs importants : ${importantes.length}.
- Missions actives : ${tasksActives.length}.
- Objectifs IA actifs : ${goalsActifs.length}.
- Recherches Web en attente : ${webEnAttente.length}.
- DÃ©cisions proposÃ©es : ${decisionsProposees.length}.
- Ã‰vÃ©nements agenda Ã  suivre : ${evenementsAPlanifier.length}.
- Objectif principal : ${objectifPrincipal}.
- Action recommandÃ©e : avancer sur les missions prioritaires, valider les dÃ©cisions utiles et planifier les Ã©vÃ©nements importants.`;

    setSyntheseHebdo(synthese);
    setRoseReponse("SynthÃ¨se hebdomadaire gÃ©nÃ©rÃ©e.");
    ajouterJournal("SynthÃ¨se hebdomadaire V7.4 gÃ©nÃ©rÃ©e.");
    parler("Jâ€™ai gÃ©nÃ©rÃ© la synthÃ¨se hebdomadaire.");
  };

  const genererAgentWeb = () => {
    setAgentWebRose([
      "Web Engine actif : Rose prÃ©pare les recherches, David valide.",
      "Recherche possible : matÃ©riaux, couverture, charpente, aides, immobilier et entreprise.",
      "SÃ©curitÃ© : aucune action externe sans validation.",
    ]);

    setRoseReponse("Agent web prÃ©parÃ©.");
    ajouterJournal("Agent web V7.4 prÃ©parÃ©.");
    parler("Mon agent web est prÃ©parÃ©.");
  };
    const genererAgendaRose = () => {
    setAgendaRose([
      "Calendar Engine actif : Rose prÃ©pare les Ã©vÃ©nements, David valide.",
      "Rose peut prÃ©parer les rendez-vous chantier, client, banque, notaire et maison.",
      "Connexion Google Calendar rÃ©elle prÃ©vue dans une prochaine Ã©tape.",
    ]);

    setRoseReponse("Agenda Rose mis Ã  jour.");
    ajouterJournal("Agenda V7.4 mis Ã  jour.");
    parler("Mon agenda intelligent est mis Ã  jour.");
  };

  const genererAutonomieRose = () => {
    setAutonomieRose([
      "Rose peut proposer une action automatiquement.",
      "Rose doit attendre la validation de David avant dâ€™agir.",
      "Rose peut crÃ©er des missions via Task Engine.",
      "Rose peut crÃ©er des objectifs via Goal Engine.",
      "Rose peut prÃ©parer des recherches via Web Engine.",
      "Rose peut proposer des dÃ©cisions via Decision Engine.",
      "Rose peut prÃ©parer des Ã©vÃ©nements via Calendar Engine.",
      "Rose ne modifie jamais son code seule sans confirmation.",
    ]);

    setRoseReponse("Autonomie contrÃ´lÃ©e mise Ã  jour.");
    ajouterJournal("Autonomie V7.4 mise Ã  jour.");
    parler("Mon autonomie contrÃ´lÃ©e est mise Ã  jour.");
  };

  const genererProfilDavid = () => {
    const profil = `Profil David :
- MÃ©tier : couverture / charpente.
- Objectif principal : ${objectifPrincipal}.
- MÃ©moires totales : ${memoires.length}.
- MÃ©moires longue durÃ©e : ${memoireLongueDuree.length}.
- Missions Rose : ${roseTasks.length}.
- Objectifs IA : ${roseGoals.length}.
- Recherches Web prÃ©parÃ©es : ${webRequests.length}.
- DÃ©cisions proposÃ©es : ${roseDecisions.length}.
- Ã‰vÃ©nements Agenda : ${calendarEvents.length}.
Rose doit aider David Ã  progresser, dÃ©cider, se souvenir, structurer ses prioritÃ©s et organiser les Ã©vÃ©nements importants.`;

    setProfilDavid(profil);
    setRoseReponse("Profil David mis Ã  jour.");
    ajouterJournal("Profil David V7.4 mis Ã  jour.");
    parler("Jâ€™ai mis Ã  jour ton profil.");
  };

  const genererPlanActionRose = () => {
    const plan: string[] = [
      `Avancer sur : ${objectifPrincipal}`,
      "Suivre les missions dans lâ€™onglet TÃ¢ches.",
      "Suivre les objectifs dans lâ€™onglet Objectifs IA.",
      "Valider les recherches utiles dans lâ€™onglet Web.",
      "Valider ou refuser les dÃ©cisions proposÃ©es.",
      "Planifier les Ã©vÃ©nements importants dans lâ€™onglet Agenda.",
      "GÃ©nÃ©rer une synthÃ¨se hebdomadaire.",
    ];

    setPlanActionRose(plan);
    setRoseReponse("Plan dâ€™action gÃ©nÃ©rÃ©.");
    ajouterJournal("Plan dâ€™action V7.4 gÃ©nÃ©rÃ©.");
    parler("Jâ€™ai gÃ©nÃ©rÃ© mon plan dâ€™action.");
  };
    const analyserHabitudesRose = () => {
    const habitudes: string[] = [];

    if (memoires.some((m) => m.categorie === "Entreprise")) {
      habitudes.push(
        "David parle rÃ©guliÃ¨rement de son entreprise, de ses clients et de ses chantiers."
      );
    }

    if (memoires.some((m) => m.categorie === "Objectif")) {
      habitudes.push(
        "David avance avec des objectifs personnels et professionnels prÃ©cis."
      );
    }

    if (roseTasks.length > 0) {
      habitudes.push(
        "David utilise Rose pour gÃ©nÃ©rer et suivre des missions."
      );
    }

    if (roseGoals.length > 0) {
      habitudes.push(
        "David utilise Rose pour structurer ses objectifs IA."
      );
    }

    if (webRequests.length > 0) {
      habitudes.push(
        "David prÃ©pare des recherches Web avec Rose avant validation."
      );
    }

    if (roseDecisions.length > 0) {
      habitudes.push(
        "David utilise Rose pour analyser et valider des dÃ©cisions."
      );
    }

    if (calendarEvents.length > 0) {
      habitudes.push(
        "David utilise Rose pour prÃ©parer ses rendez-vous, rappels et Ã©vÃ©nements importants."
      );
    }

    if (habitudes.length === 0) {
      habitudes.push(
        "Rose manque encore dâ€™informations pour dÃ©tecter des habitudes fiables."
      );
    }

    setHabitudesRose(habitudes);
    setRoseReponse("Jâ€™ai analysÃ© tes habitudes.");
    ajouterJournal("Habitudes V7.4 analysÃ©es.");
    parler("Jâ€™ai analysÃ© tes habitudes.");
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
- Recherches Web prÃ©parÃ©es : ${webRequests.length}.
- DÃ©cisions proposÃ©es : ${roseDecisions.length}.
- Ã‰vÃ©nements chantier ou client : ${evenementsEntreprise}.
- Objectif principal : ${objectifPrincipal}.

Conseil : ajoute rÃ©guliÃ¨rement tes chantiers, tes montants, tes rÃ©ussites, tes difficultÃ©s et tes rendez-vous importants pour que Rose puisse mieux tâ€™aider Ã  organiser ton activitÃ©.`;

    setCoachEntreprise(texte);
    setRoseReponse("Coach entreprise gÃ©nÃ©rÃ©.");
    ajouterJournal("Coach entreprise V7.4 gÃ©nÃ©rÃ©.");
    parler("Jâ€™ai gÃ©nÃ©rÃ© le coach entreprise.");
  };

  const genererActionsRecommandees = () => {
    const actions: string[] = [
      "Ajouter une mÃ©moire importante ou longue durÃ©e.",
      `Faire une action concrÃ¨te pour : ${objectifPrincipal}`,
      "Suivre les missions dans lâ€™onglet TÃ¢ches.",
      "Suivre les objectifs dans lâ€™onglet Objectifs IA.",
      "Valider ou annuler les recherches Web prÃ©parÃ©es.",
      "Valider ou refuser les dÃ©cisions proposÃ©es.",
      "Planifier les Ã©vÃ©nements importants dans lâ€™onglet Agenda.",
      "GÃ©nÃ©rer ou mettre Ã  jour la synthÃ¨se hebdomadaire.",
    ];

    setActionsRecommandees(actions);
    setRoseReponse("Actions recommandÃ©es gÃ©nÃ©rÃ©es.");
    ajouterJournal("Actions recommandÃ©es V7.4 gÃ©nÃ©rÃ©es.");
    parler("Jâ€™ai gÃ©nÃ©rÃ© les actions recommandÃ©es.");
  };
    const regenererTachesRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestTasksFromMemory(memoriesText);

    setRoseTasks(suggested);
    setRoseReponse("Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes missions Ã  partir de ma mÃ©moire.");
    ajouterJournal("Missions Rose V7.4 rÃ©gÃ©nÃ©rÃ©es.");
    parler("Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes missions.");
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
                "DÃ©finir et atteindre mon objectif principal",
              progress: 0,
              status: "active",
              subGoals: [
                "DÃ©finir les prochaines actions prioritaires",
                "RÃ©aliser une premiÃ¨re action cette semaine",
                "Mesurer rÃ©guliÃ¨rement la progression",
              ],
            },
          ];

    setRoseGoals(objectifsGeneres);

    setRoseReponse(
      suggested.length > 0
        ? "Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes objectifs IA Ã  partir de ma mÃ©moire."
        : "Ma mÃ©moire ne contenait pas encore assez dâ€™informations. Jâ€™ai crÃ©Ã© un premier objectif Ã  partir de ton objectif principal."
    );

    ajouterJournal(
      suggested.length > 0
        ? "Objectifs IA V7.4 rÃ©gÃ©nÃ©rÃ©s."
        : "Objectif IA par dÃ©faut crÃ©Ã©."
    );

    parler(
      suggested.length > 0
        ? "Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes objectifs IA."
        : "Jâ€™ai crÃ©Ã© un premier objectif IA."
    );
  };

  const regenererRecherchesWeb = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestWebQueriesFromMemory(memoriesText);

    setWebRequests(suggested);
    setRoseReponse(
      "Jâ€™ai prÃ©parÃ© des recherches Web Ã  partir de ma mÃ©moire."
    );
    ajouterJournal("Recherches Web V7.4 prÃ©parÃ©es.");
    parler("Jâ€™ai prÃ©parÃ© les recherches Web.");
  };

  const regenererDecisionsRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestDecisionsFromMemory(memoriesText);

    setRoseDecisions(suggested);
    setRoseReponse(
      "Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes dÃ©cisions Ã  partir de ma mÃ©moire."
    );
    ajouterJournal("DÃ©cisions Rose V7.4 rÃ©gÃ©nÃ©rÃ©es.");
    parler("Jâ€™ai rÃ©gÃ©nÃ©rÃ© mes dÃ©cisions.");
  };

  const regenererAgendaRose = () => {
    const memoriesText = memoires.map((m) => m.texte);
    const suggested = suggestCalendarEventsFromMemory(memoriesText);

    setCalendarEvents(suggested);
    setRoseReponse(
      "Jâ€™ai prÃ©parÃ© les Ã©vÃ©nements Agenda Ã  partir de ma mÃ©moire."
    );
    ajouterJournal("Ã‰vÃ©nements Agenda V7.4 prÃ©parÃ©s.");
    parler("Jâ€™ai prÃ©parÃ© les Ã©vÃ©nements de lâ€™agenda.");
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
      (m) => m.importance === "Longue durÃ©e"
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
          MÃ©moire â€¢ TÃ¢ches â€¢ Objectifs IA â€¢ Web â€¢ DÃ©cisions â€¢ Agenda
        </Text>

        <Text style={styles.cloud}>{cloudStatus}</Text>

        <View style={styles.tabs}>
          <TabButton
            title="Rose"
            active={tab === "rose"}
            onPress={() => setTab("rose")}
          />

          <TabButton
            title="MÃ©moire"
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
            title="DÃ©cisions"
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
            title="TÃ¢ches"
            active={tab === "tasks"}
            onPress={() => setTab("tasks")}
          />
          <TabButton
            title="Validations"
            active={tab === "approvals"}
            onPress={() => setTab("approvals")}
          />
          <TabButton
            title="ExÃƒÂ©cution"
            active={tab === "executionQueue"}
            onPress={() => setTab("executionQueue")}
          />
          <TabButton
            title="Preuves"
            active={tab === "evidence"}
            onPress={() => setTab("evidence")}
          />
          <TabButton
            title="Audits"
            active={tab === "auditHistory"}
            onPress={() => setTab("auditHistory")}
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
          {tab === "approvals" && (
            <ApprovalScreen />
          )}
          {tab === "executionQueue" && (
            <ExecutionQueueScreen />
          )}
          {tab === "evidence" && (
            <EvidenceLedgerScreen />
          )}
          {tab === "auditHistory" && (
            <AuditHistoryScreen />
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
