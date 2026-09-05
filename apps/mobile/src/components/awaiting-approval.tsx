import { Alert, View } from "react-native";
import { LogOut, UserPlus } from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import { Button } from "./button";
import { Screen } from "./screen";
import { Text } from "./text";

/**
 * Tela única de quem pediu para ser contato de emergência e ainda não teve
 * resposta do paciente.
 *
 * Enquanto o vínculo está pendente a API nega todas as rotas de dados do
 * paciente, então não existe aba com conteúdo para mostrar. Antes só o Perfil
 * tratava o caso e as outras quatro abas abriam vazias, sem dizer por quê.
 */
export function AwaitingApproval({ onSignOut }: { onSignOut: () => void }) {
  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Você precisará entrar de novo para acessar o app.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: onSignOut },
    ]);
  }

  return (
    <Screen center>
      <View className="items-center">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-warning-subtle border border-warning-border">
          <UserPlus size={24} color={colors.status.warning.fg} />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center text-section-title font-semibold text-foreground"
        >
          Aguardando o paciente
        </Text>
        <Text className="mt-2 text-center text-body-sm text-foreground-tertiary">
          Seu pedido para ser contato de emergência foi enviado. Até o paciente
          aceitar, você não tem acesso aos dados dele.
        </Text>
        <Text className="mt-4 text-center text-body-sm text-foreground-tertiary">
          Assim que ele responder, o app abre sozinho com os dados liberados.
        </Text>
        <Button
          className="mt-8"
          label="Sair"
          variant="destructive"
          icon={<LogOut size={16} color={colors.status.danger.fg} />}
          onPress={confirmSignOut}
        />
      </View>
    </Screen>
  );
}
