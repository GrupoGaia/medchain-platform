import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ShieldPlus } from "lucide-react-native";
import {
  Button,
  Field,
  Screen,
  Surface,
  Text,
} from "../../src/components";
import { useAuth } from "../../src/context/AuthProvider";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) setError("E-mail ou senha incorretos.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <Screen center>
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-interactive">
            <ShieldPlus size={26} color="#FFFFFF" />
          </View>
          <Text
            accessibilityRole="header"
            className="mt-3 text-page-title font-bold text-foreground"
          >
            MedChain
          </Text>
          <Text className="mt-1 text-center text-body-sm text-foreground-tertiary">
            Seu prontuário, sob o seu controle.
          </Text>
        </View>

        <Surface className="mt-8">
          <Text className="text-section-title font-semibold text-foreground">
            Entrar
          </Text>

          {error ? (
            <View
              accessibilityRole="alert"
              className="mt-3 rounded-lg border border-danger-border bg-danger-subtle px-3 py-2.5"
            >
              <Text className="text-body-sm font-medium text-danger">{error}</Text>
            </View>
          ) : null}

          <View className="mt-4 gap-4">
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
              autoComplete="current-password"
              textContentType="password"
              placeholder="Sua senha"
            />
          </View>

          <Button
            className="mt-5"
            label="Entrar"
            loading={loading}
            disabled={loading}
            onPress={handleSignIn}
          />

          {/* A tela de cadastro existia mas nao tinha como ser aberta: nada no
              app navegava ate ela. Sem este link, nem paciente novo nem contato
              de emergencia conseguem criar conta. */}
          <Pressable
            onPress={() => router.push("/(auth)/cadastro" as never)}
            accessibilityRole="button"
            accessibilityLabel="Criar uma conta"
            className="mt-3 min-h-touch items-center justify-center"
          >
            <Text className="text-body-sm text-foreground-tertiary">
              Não tem conta?{" "}
              <Text className="font-semibold text-interactive">Criar conta</Text>
            </Text>
          </Pressable>
        </Surface>

        <Surface tone="subtle" className="mt-5">
          <Text className="text-overline font-semibold uppercase text-foreground-tertiary">
            Ambiente de demonstração
          </Text>
          <Text className="mt-1.5 text-body-sm text-foreground-secondary">
            joao.batista@exemplo.com
          </Text>
          <Text className="text-body-sm text-foreground-secondary">
            Senha: medchain123
          </Text>
        </Surface>
      </Screen>
    </KeyboardAvoidingView>
  );
}
