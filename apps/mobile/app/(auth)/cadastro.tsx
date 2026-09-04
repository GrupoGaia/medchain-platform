import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { isValidCpf, normalizeCpf } from "@medchain/domain";
import {
  Button,
  Field,
  Screen,
  ScreenHeader,
  SectionHeader,
  Surface,
  Text,
} from "../../src/components";
import { useAuth } from "../../src/context/AuthProvider";

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

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "PATIENT",
    label: "Sou o paciente",
    description: "Você controla quem vê o seu prontuário.",
  },
  {
    value: "EMERGENCY_CONTACT",
    label: "Sou contato de emergência",
    description: "Você responde por um paciente, depois que ele aceitar.",
  },
];

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

  async function handleSignUp() {
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
    const result = await signUp(
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
    if (result.error) {
      setError(
        result.error.includes("already")
          ? "Este e-mail já está cadastrado."
          : result.error
      );
    }
    // signUp com confirmação automática (email_confirm: true no seed).
    // Na produção aguardar confirmação por email.
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <Screen>
        <ScreenHeader
          title="Criar conta"
          subtitle="Leva menos de um minuto e não pede nenhum dado clínico agora."
          onBack={() => router.back()}
        />

        {error ? (
          <View
            accessibilityRole="alert"
            className="mb-4 rounded-lg border border-danger-border bg-danger-subtle px-3 py-2.5"
          >
            <Text className="text-body-sm font-medium text-danger">{error}</Text>
          </View>
        ) : null}

        <View className="gap-6">
          {/* Papel primeiro: é ele que muda o significado do CPF pedido logo
              abaixo, de "o seu" para "o do paciente". */}
          <View className="gap-3">
            <SectionHeader title="Quem é você" />
            <View accessibilityRole="radiogroup" className="gap-2">
              {ROLES.map((option) => {
                const active = role === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setRole(option.value);
                      setCpf("");
                      setError(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active, checked: active }}
                    accessibilityLabel={`${option.label}. ${option.description}`}
                    className={`min-h-touch justify-center rounded-xl border px-4 py-3 ${
                      active
                        ? "border-interactive bg-interactive-subtle"
                        : "border-border bg-surface active:bg-surface-subtle"
                    }`}
                  >
                    <Text
                      className={`text-body ${
                        active
                          ? "font-semibold text-interactive"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="mt-0.5 text-caption text-foreground-tertiary">
                      {option.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-3">
            <SectionHeader title="Seus dados" />
            <Surface>
              <View className="gap-4">
                <Field
                  label="Nome completo"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  placeholder="João da Silva"
                />
                <Field
                  label={isContact ? "CPF do paciente" : "Seu CPF"}
                  value={cpf}
                  onChangeText={(value) => setCpf(maskCpf(value))}
                  keyboardType="number-pad"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  hint={
                    isContact
                      ? "O paciente precisa aceitar seu pedido antes de você ver qualquer dado."
                      : "É por ele que o profissional localiza você para pedir acesso."
                  }
                />

                {isContact && (
                  <>
                    <Field
                      label="Seu parentesco"
                      value={relation}
                      onChangeText={setRelation}
                      autoCapitalize="words"
                      placeholder="Filha, cônjuge, irmão"
                    />
                    <Field
                      label="Seu telefone"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="(11) 9 9999-0000"
                    />
                  </>
                )}
              </View>
            </Surface>
          </View>

          <View className="gap-3">
            <SectionHeader title="Acesso à conta" />
            <Surface>
              <View className="gap-4">
                <Field
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  placeholder="seu@email.com"
                />
                <Field
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  placeholder="Mínimo de 6 caracteres"
                  hint="Use uma senha que você não usa em outro serviço."
                />
              </View>
            </Surface>
          </View>

          <Button
            label="Criar conta"
            loading={loading}
            disabled={loading}
            onPress={handleSignUp}
          />

          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela de entrar"
            className="min-h-touch items-center justify-center"
          >
            <Text className="text-body-sm text-foreground-tertiary">
              Já tem conta?{" "}
              <Text className="font-semibold text-interactive">Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
