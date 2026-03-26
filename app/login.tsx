import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Невалиден имейл или парола.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.top}>
        <Text style={styles.paw}>🐾</Text>
        <Text style={styles.appName}>PetRadar</Text>
        <Text style={styles.tagline}>Помогни на изгубените любимци да се приберат.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Вход</Text>

        <View style={styles.fields}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Имейл</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#AEAEB2"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Парола</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#AEAEB2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, !canSubmit && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={!canSubmit || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Влез</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Нямаш акаунт? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")} activeOpacity={0.7}>
          <Text style={styles.footerLink}>Регистрирай се</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  top: {
    alignItems: "center",
    gap: 6,
  },
  paw: {
    fontSize: 48,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#6C6C70",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  fields: {
    gap: 12,
  },
  inputWrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C6C70",
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1C1C1E",
  },
  error: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
  btn: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6C6C70",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
});
