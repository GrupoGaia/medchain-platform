import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../src/context/AuthProvider";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError("Email ou senha incorretos.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-teal-50"
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo */}
        <View className="mb-8 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-teal-600">
            <Text className="text-2xl font-bold text-white">M</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">MedChain</Text>
          <Text className="mt-1 text-sm text-gray-500">Seu prontuário, sob seu controle</Text>
        </View>

        {/* Card */}
        <View className="w-full rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Entrar</Text>

          {error && (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          <View className="mb-3">
            <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="seu@email.com"
              className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
            />
          </View>

          <View className="mb-5">
            <Text className="mb-1 text-sm font-medium text-gray-700">Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="items-center rounded-xl bg-teal-600 py-3"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-semibold text-white">Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View className="mt-6 rounded-xl bg-white/70 px-4 py-3">
          <Text className="text-center text-xs font-semibold text-gray-500">
            Demo — senha: medchain123
          </Text>
          <Text className="mt-0.5 text-center text-xs text-gray-400">
            joao.batista@exemplo.com (paciente)
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
