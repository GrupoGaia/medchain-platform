import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, SectionLabel, Text } from "../../src/components";
import emptyAccess from "../../assets/img/empty-access.png";
import { useRouter } from "expo-router";
import { ShieldCheck, ShieldOff, ShieldX, Clock } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { formatMinutesRemaining, SCOPE_LABEL } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";

export default function PermissoesScreen() {
  const router = useRouter();
  const { activeTokens, state, revokeToken, pendingRequests } = useAppStore();

  function minutesLeft(expiresAt: string): number {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-2 text-2xl font-bold text-gray-900">Permissões</Text>
        <Text className="mb-6 text-sm text-gray-500">
          Controle quem tem acesso aos seus dados
        </Text>

        {/* Pedidos pendentes */}
        {pendingRequests.length > 0 && (
          <>
            <SectionLabel tone="warning">
              Aguardando resposta
            </SectionLabel>
            {pendingRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                onPress={() =>
                  router.push({ pathname: "/autorizacao/[id]" as never, params: { id: req.id } })
                }
                activeOpacity={0.8}
                className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"
                accessibilityLabel={`Responder pedido de ${req.professional.fullName}`}
                accessibilityRole="button"
              >
                <View className="mb-3 flex-row items-center gap-2">
                  <Clock color={colors.alert.amber} size={18} />
                  <Text className="text-sm font-semibold text-amber-700">Pedido pendente</Text>
                </View>
                <Text className="text-base font-bold text-gray-900">{req.professional.fullName}</Text>
                <Text className="text-sm text-gray-500">{req.professional.crm}</Text>
                <Text className="mb-3 text-sm text-gray-500">
                  {req.professional.institution?.name ?? ""}
                </Text>
                <View className="rounded-lg bg-amber-100 px-3 py-2">
                  <Text className="text-xs text-amber-800">Toque para responder</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Acessos ativos */}
        {activeTokens.length > 0 && (
          <>
            <SectionLabel>
              Acessos ativos
            </SectionLabel>
            {activeTokens.map((token) => (
              <View key={token.id} className="mb-3 rounded-2xl bg-white p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <ShieldCheck color={colors.brand[700]} size={20} />
                  <Text className="text-sm font-semibold text-brand-700">
                    Ativo · {formatMinutesRemaining(minutesLeft(token.expiresAt))} restantes
                  </Text>
                </View>
                <Text className="text-base font-bold text-gray-900">{token.professional.fullName}</Text>
                <Text className="text-sm text-gray-500">{token.professional.crm}</Text>
                <Text className="mb-1 text-sm text-gray-500">
                  {token.professional.institution?.name ?? ""}
                </Text>
                <View className="mb-4 self-start rounded-full bg-brand-50 px-3 py-1">
                  <Text className="text-xs text-brand-700">{SCOPE_LABEL[token.scope]}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => revokeToken(token.id)}
                  className="flex-row items-center justify-center gap-2 rounded-xl bg-red-50 py-3"
                  accessibilityLabel={`Revogar acesso de ${token.professional.fullName}`}
                  accessibilityRole="button"
                >
                  <ShieldOff color={colors.alert.red} size={16} />
                  <Text className="text-sm font-semibold text-red-600">Revogar acesso</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Acessos encerrados */}
        {state.tokens.filter((t) => t.status !== "ACTIVE").length > 0 && (
          <>
            <SectionLabel className="mt-2">
              Acessos encerrados
            </SectionLabel>
            {state.tokens
              .filter((t) => t.status !== "ACTIVE")
              .map((token) => (
                <View key={token.id} className="mb-2 flex-row items-center gap-3 rounded-xl bg-white p-4">
                  <ShieldX color={colors.neutral.muted} size={18} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">
                      {token.professional.fullName}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {token.status === "REVOKED" ? "Revogado pelo paciente" : "Expirado"}
                    </Text>
                  </View>
                </View>
              ))}
          </>
        )}

        {activeTokens.length === 0 && pendingRequests.length === 0 && (
          <Card className="py-8">
            <EmptyState
              image={emptyAccess}
              title="Nenhum acesso ativo"
              description="Seus dados estão protegidos"
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
