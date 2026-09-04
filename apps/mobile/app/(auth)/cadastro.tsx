import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "../../src/components";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthProvider";
import { isValidCpf, normalizeCpf } from "@medchain/domain";

type Role = "PATIENT" | "EMERGENCY_CONTACT";

// Mascara so para leitura enquanto digita. A validacao e a do dominio, aqui e
// de novo no servidor.
function maskCpf(value: string): string {
  const digits = normalizeCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("PATIENT");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isContact = role === "EMERGENCY_CONTACT";

  const handleSignUp = async () => {
    if (!fullName || !cpf || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setError(
        isContact
          ? "CPF do paciente inválido. Confira os números."
          : "CPF inválido. Confira os números digitados."
      );
      return;
    }
    if (isContact && (!relation || !phone)) {
      setError("Informe seu parentesco e telefone.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signUp(
      email.trim(),
      password,
      isContact
        ? {
            role: "EMERGENCY_CONTACT",
            fullName: fullName.trim(),
            patientCpf: normalizeCpf(cpf),
            relation: relation.trim(),
            phone: phone.trim(),
          }
        : { role: "PATIENT", fullName: fullName.trim(), cpf: normalizeCpf(cpf) }
    );
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
      className="flex-1 bg-brand-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="mb-6 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
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

            <Text className="mb-2 text-sm font-medium text-gray-700">Você é</Text>
            <View className="mb-4 flex-row gap-2">
              {(
                [
                  ["PATIENT", "Paciente"],
                  ["EMERGENCY_CONTACT", "Contato de emergência"],
                ] as const
              ).map(([value, label]) => {
                const active = role === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setRole(value);
                      setCpf("");
                      setError(null);
                    }}
                    className={`flex-1 rounded-xl border px-3 py-2.5 ${
                      active ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                  >
                    <Text
                      className={`text-center text-xs font-semibold ${
                        active ? "text-brand-700" : "text-gray-600"
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
              <Text className="mb-1 text-sm font-medium text-gray-700">
                {isContact ? "CPF do paciente" : "CPF"}
              </Text>
              <TextInput
                value={cpf}
                onChangeText={(value) => setCpf(maskCpf(value))}
                keyboardType="number-pad"
                placeholder="000.000.000-00"
                maxLength={14}
                className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
              />
              <Text className="mt-1 text-xs text-gray-400">
                {isContact
                  ? "O paciente precisa aceitar seu pedido antes de você ver qualquer dado."
                  : "É por ele que o médico localiza você para pedir acesso."}
              </Text>
            </View>

            {isContact && (
              <>
                <View className="mb-3">
                  <Text className="mb-1 text-sm font-medium text-gray-700">
                    Seu parentesco
                  </Text>
                  <TextInput
                    value={relation}
                    onChangeText={setRelation}
                    autoCapitalize="words"
                    placeholder="Filha, Cônjuge, Irmão"
                    className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
                  />
                </View>

                <View className="mb-3">
                  <Text className="mb-1 text-sm font-medium text-gray-700">Seu telefone</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="(11) 9 9999-0000"
                    className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
                  />
                </View>
              </>
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
                placeholder="mínimo 6 caracteres"
                className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900"
              />
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="mb-3 items-center rounded-xl bg-brand-600 py-3"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">Criar conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="items-center py-2">
              <Text className="text-sm text-gray-500">
                Já tem conta? <Text className="font-medium text-brand-600">Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
