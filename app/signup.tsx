import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Грешка при регистрация. Опитай отново.",
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <MaterialCommunityIcons name="paw" size={48} color="#1C1C1E" />
          <Text style={styles.appName}>PetRadar</Text>
          <Text style={styles.tagline}>
            Помогни на изгубените любимци да се приберат.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Регистрация</Text>

          <View style={styles.fields}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Пълно име</Text>
              <TextInput
                style={styles.input}
                placeholder="Иван Иванов"
                placeholderTextColor="#AEAEB2"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
                onSubmitEditing={handleSignup}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Създай акаунт</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Вече имаш акаунт? </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Влез</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
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
