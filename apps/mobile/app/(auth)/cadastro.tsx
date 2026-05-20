import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthProvider";

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) {
      setError(error.includes("already") ? "Este email já está cadastrado." : error);
      return;
    }
    // signUp com confirmação automática (email_confirm: true no seed)
    // Na produção aguardar confirmação por email
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-teal-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="mb-6 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-teal-600">
              <Text className="text-xl font-bold text-white">M</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">Criar conta</Text>
          </View>

          <View className="w-full rounded-2xl bg-white p-6 shadow-sm">
            {error && (
              <View className="mb-4 rounded-lg bg-red-50 p-3">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="mb-1 text-sm font-medium text-gray-700">Nome completo</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholder="João da Silva"
                className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
              />
            </View>

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
                placeholder="mínimo 6 caracteres"
                className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
              />
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="mb-3 items-center rounded-xl bg-teal-600 py-3"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">Criar conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="items-center py-2">
              <Text className="text-sm text-gray-500">
                Já tem conta? <Text className="font-medium text-teal-600">Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
