import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { playTtsFromBase64 } from "./src/tts/playTtsFromBase64";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./src/lib/supabase";

export default function App() {
  // 🔐 x-app-key (APP_API_KEY) = secret côté Supabase Edge Functions
  const X_APP_KEY = "rose-secret-123"; // EXACT (pas un prefix)

  // UI
  const [online, setOnline] = useState(true);
  const [statusText, setStatusText] = useState("Micro prêt 🎤");

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Chat
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: "m1", from: "rose", text: "Coucou 🌹 Je suis Rose. Connecte-toi puis écris-moi 💜" },
  ]);

  const listRef = useRef(null);

  const avatarSource = useMemo(() => {
    return null; // require("./assets/avatar.png") si tu veux
  }, []);

  async function getJwt() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  }

  async function signIn() {
    try {
      const e = email.trim();
      if (!e || !password) {
        Alert.alert("Login", "Entre ton email + mot de passe.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: e,
        password,
      });

      if (error) {
        Alert.alert("Login error", error.message);
        return;
      }

      if (!data?.session?.access_token) {
        Alert.alert("Login", "Session manquante. Réessaie.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: `r-${Date.now()}`, from: "rose", text: "✅ Connecté. Parle-moi 💜" },
      ]);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (err) {
      Alert.alert("Login error", String(err?.message ?? err));
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMessages([{ id: "m1", from: "rose", text: "Déconnecté. Reconnecte-toi 💜" }]);
  }

  async function pushUserMessage(text) {
    const t = text.trim();
    if (!t) return;

    // 1) message user
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userId, from: "user", text: t }]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);

    // 2) placeholder
    const pendingId = `r-${Date.now()}-pending`;
    setMessages((prev) => [...prev, { id: pendingId, from: "rose", text: "..." }]);

    try {
      setOnline(true);

      const jwt = await getJwt();
      if (!jwt) {
        setOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId ? { ...m, text: "❌ Pas connecté. Connecte-toi d’abord." } : m
          )
        );
        return;
      }

      const fnUrl = `${SUPABASE_URL}/functions/v1/chat`;

      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,     // ✅ JWT obligatoire en scope user
          apikey: SUPABASE_ANON_KEY,          // ✅ anon key
          "x-app-key": X_APP_KEY,             // ✅ app key
        },
        body: JSON.stringify({
          message: t,
          tts: true,
          scope: "user", // ✅ IMPORTANT : mémoire par user
        }),
      });

      const data = await res.json().catch(() => null);

      const answer =
        data?.answer ||
        data?.error ||
        `Erreur (${res.status})`;

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? { ...m, text: answer } : m)));

      if (data?.audio_base64 && data?.audio_mime) {
        await playTtsFromBase64(data.audio_base64, data.audio_mime);
      }

      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (e) {
      setOnline(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, text: "❌ Erreur réseau / API (voir console)" } : m
        )
      );
      console.log("API error:", e);
    }
  }

  async function onMicPress() {
    setStatusText("Micro (demo) ✅");
    setTimeout(() => setStatusText("Micro prêt 🎤"), 1200);
  }

  const isLoggedIn = true; // On peut aussi le calculer, mais on garde simple visuel.

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarWrap}>
                  {avatarSource ? (
                    <Image source={avatarSource} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>R</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Rose IA</Text>
                  <Text style={styles.subtitle}>Rose+Violet · {statusText}</Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <View style={[styles.badge, online ? styles.badgeOn : styles.badgeOff]}>
                  <Text style={styles.badgeText}>{online ? "EN LIGNE" : "HORS LIGNE"}</Text>
                </View>
              </View>
            </View>

            {/* Login card */}
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Connexion (email + mot de passe)</Text>

              <TextInput
                style={styles.loginInput}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.loginInput}
                placeholder="Mot de passe"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={styles.loginBtn} onPress={signIn}>
                  <Text style={styles.loginBtnText}>Se connecter</Text>
                </Pressable>

                <Pressable style={styles.logoutBtn} onPress={signOut}>
                  <Text style={styles.logoutBtnText}>Déconnexion</Text>
                </Pressable>
              </View>

              <Text style={styles.loginHint}>
                ⚠️ Tu dois avoir créé l’utilisateur dans Supabase Auth (Users).
              </Text>
            </View>

            {/* Chat */}
            <View style={styles.chatCard}>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContent}
                renderItem={({ item }) => {
                  const isRose = item.from === "rose";
                  return (
                    <View
                      style={[
                        styles.bubble,
                        isRose ? styles.bubbleRose : styles.bubbleUser,
                        isRose ? styles.alignLeft : styles.alignRight,
                      ]}
                    >
                      <Text style={styles.bubbleText}>{item.text}</Text>
                    </View>
                  );
                }}
                onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
              />
            </View>

            {/* Input bar */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.input}
                  placeholder="Écris…"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={() => pushUserMessage(input)}
                  returnKeyType="send"
                />

                <Pressable style={styles.micBtn} onPress={onMicPress}>
                  <Text style={styles.micIcon}>🎤</Text>
                </Pressable>

                <Pressable style={styles.sendBtn} onPress={() => pushUserMessage(input)}>
                  <Text style={styles.sendText}>Envoyer</Text>
                </Pressable>
              </View>

              <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#14121B" }} />
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#14121B" },
  screen: { flex: 1, backgroundColor: "#14121B", paddingHorizontal: 14 },

  header: {
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerRight: { alignItems: "flex-end" },

  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(160,110,255,0.45)",
  },
  avatar: { width: 44, height: 44, resizeMode: "cover" },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: "rgba(160,110,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: { color: "#EDE7FF", fontWeight: "800", fontSize: 18 },

  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.65)", marginTop: 2 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeOn: { backgroundColor: "rgba(160,110,255,0.18)", borderColor: "rgba(160,110,255,0.55)" },
  badgeOff: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" },
  badgeText: { color: "#EDE7FF", fontWeight: "800", letterSpacing: 0.5 },

  loginCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 10,
  },
  loginTitle: { color: "#fff", fontWeight: "800", marginBottom: 8, fontSize: 14 },
  loginInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 8,
  },
  loginBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(160,110,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(160,110,255,0.45)",
  },
  loginBtnText: { color: "#fff", fontWeight: "800" },
  logoutBtn: {
    width: 130,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  logoutBtnText: { color: "#fff", fontWeight: "800" },
  loginHint: { color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 12 },

  chatCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  chatContent: { padding: 14, paddingBottom: 18, gap: 12 },

  bubble: {
    maxWidth: "88%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  bubbleRose: {
    backgroundColor: "rgba(160,110,255,0.12)",
    borderColor: "rgba(160,110,255,0.32)",
  },
  bubbleUser: {
    backgroundColor: "rgba(255,105,180,0.10)",
    borderColor: "rgba(255,105,180,0.22)",
  },
  alignLeft: { alignSelf: "flex-start" },
  alignRight: { alignSelf: "flex-end" },
  bubbleText: { color: "#FFFFFF", fontSize: 16, lineHeight: 22 },

  inputBar: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  micBtn: {
    width: 48,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(160,110,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(160,110,255,0.35)",
  },
  micIcon: { fontSize: 20 },
  sendBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,105,180,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,105,180,0.30)",
  },
  sendText: { color: "#FFFFFF", fontWeight: "800" },
});
