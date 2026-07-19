import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Voice from "@react-native-voice/voice";

export default function App() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", role: "rose", text: "Coucou 🌹 Je suis Rose. Appuie sur le micro et parle 💜" },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState("Prête à t’écouter…");
  const [partial, setPartial] = useState("");

  const listRef = useRef(null);
  const styles = useMemo(() => createStyles(insets), [insets]);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setVoiceHint("Je t’écoute…");
      setPartial("");
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setVoiceHint("Dictée terminée ✅");
      setTimeout(() => setVoiceHint("Prête à t’écouter…"), 1200);
    };

    Voice.onSpeechPartialResults = (e) => {
      const txt = e?.value?.[0] ?? "";
      setPartial(txt);
    };

    Voice.onSpeechResults = (e) => {
      const txt = e?.value?.[0] ?? "";
      if (txt) {
        setInput((prev) => (!prev.trim() ? txt : (prev.trim() + " " + txt).trim()));
      }
      setPartial("");
    };

    Voice.onSpeechError = (e) => {
      setIsListening(false);
      setPartial("");
      const msg =
        e?.error?.message ||
        e?.message ||
        "Erreur dictée (autorisation / micro).";

      setVoiceHint("Micro — échec");
      Alert.alert(
        "Micro — échec",
        msg +
          "\n\n1) Autorise le micro\n2) Ferme les apps qui utilisent le micro",
        [{ text: "OK" }]
      );

      setTimeout(() => setVoiceHint("Prête à t’écouter…"), 1500);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    const roseMsg = {
      id: `r-${Date.now() + 1}`,
      role: "rose",
      text: "Je t’ai entendu 💜 (Prochaine étape : vraie réponse IA + mémoire.)",
    };

    setMessages((prev) => [...prev, userMsg, roseMsg]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const toggleMic = async () => {
    try {
      // IMPORTANT: si le module natif n’est pas chargé -> startSpeech of null
      // Dans ce cas, ce n’est pas App.js le problème : c’est le build natif.
      if (isListening) {
        await Voice.stop();
        return;
      }
      await Voice.start("fr-FR");
    } catch (e) {
      setIsListening(false);
      const msg = e?.message || "Impossible de démarrer le micro.";
      setVoiceHint("Impossible de démarrer le micro.");
      Alert.alert("Micro — échec", msg, [{ text: "OK" }]);
      setTimeout(() => setVoiceHint("Prête à t’écouter…"), 1500);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRose]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image source={require("./assets/avatar.png")} style={styles.avatar} resizeMode="cover" />
          </View>
          <View>
            <Text style={styles.title}>Rose IA</Text>
            <Text style={styles.subtitle}>Rose+Violet • Micro prêt 🎤</Text>
          </View>
        </View>

        <View style={[styles.headerBadge, isListening && styles.headerBadgeOn]}>
          <Text style={styles.badgeText}>{isListening ? "ÉCOUTE" : "EN LIGNE"}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 24}
      >
        {/* Chat */}
        <View style={styles.chatCard}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        {/* Voice hint */}
        <View style={styles.micHint}>
          <Text style={styles.micHintText}>
            {voiceHint}
            {partial ? `\n… ${partial}` : ""}
          </Text>
        </View>

        {/* Input + Mic */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écris… ou parle au micro 🎤"
            placeholderTextColor="rgba(255,255,255,0.55)"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
          />

          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnOn]}
            onPress={toggleMic}
            activeOpacity={0.85}
          >
            {isListening ? <ActivityIndicator /> : <Text style={styles.micText}>🎤</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.85}>
            <Text style={styles.sendText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(insets) {
  const deep = "#0b0616";
  const card = "rgba(255,255,255,0.10)";
  const stroke = "rgba(255,255,255,0.18)";
  const text = "#ffffff";

  // ✅ S21 gesture bar: on remonte la barre
  const bottomSafe = Math.max(insets.bottom, 12);

  return {
    safe: { flex: 1, backgroundColor: deep },
    bg: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: deep },

    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

    avatarWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      padding: 2,
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: stroke,
      overflow: "hidden",
    },
    avatar: { width: "100%", height: "100%", borderRadius: 16 },

    title: { color: text, fontSize: 18, fontWeight: "800" },
    subtitle: { color: "rgba(255,255,255,0.70)", fontSize: 12, marginTop: 2 },

    headerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: stroke,
      backgroundColor: "rgba(124,58,237,0.18)",
    },
    headerBadgeOn: { backgroundColor: "rgba(255,79,216,0.20)" },
    badgeText: { color: text, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

    kav: {
      flex: 1,
      paddingHorizontal: 16,
      // ✅ important: remonte tout le bas au-dessus de la barre gestes
      paddingBottom: bottomSafe,
    },

    chatCard: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: stroke,
      backgroundColor: card,
      overflow: "hidden",
    },
    // ✅ grand padding bas pour ne pas être caché par la barre input
    listContent: { padding: 14, paddingBottom: 18 },

    bubbleRow: { marginBottom: 10, flexDirection: "row" },
    rowLeft: { justifyContent: "flex-start" },
    rowRight: { justifyContent: "flex-end" },

    bubble: { maxWidth: "85%", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
    bubbleRose: { backgroundColor: "rgba(255,79,216,0.14)", borderColor: "rgba(255,79,216,0.25)" },
    bubbleUser: { backgroundColor: "rgba(124,58,237,0.18)", borderColor: "rgba(124,58,237,0.28)" },

    bubbleText: { color: "#fff", fontSize: 15, lineHeight: 20 },

    micHint: {
      marginTop: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: stroke,
      backgroundColor: "rgba(255,255,255,0.06)",
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    micHintText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 10,
      padding: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: stroke,
      backgroundColor: "rgba(255,255,255,0.08)",
      // ✅ encore un petit push vers le haut sur Samsung geste bar
      marginBottom: bottomSafe,
    },
    input: {
      flex: 1,
      height: 46,
      paddingHorizontal: 12,
      borderRadius: 12,
      color: "#fff",
      backgroundColor: "rgba(0,0,0,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      fontSize: 15,
    },

    micBtn: {
      width: 46,
      height: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      backgroundColor: "rgba(124,58,237,0.18)",
    },
    micBtnOn: { backgroundColor: "rgba(255,79,216,0.22)" },
    micText: { fontSize: 18 },

    sendBtn: {
      height: 46,
      paddingHorizontal: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      backgroundColor: "rgba(255,79,216,0.20)",
    },
    sendText: { color: "#fff", fontWeight: "800" },
  };
}
