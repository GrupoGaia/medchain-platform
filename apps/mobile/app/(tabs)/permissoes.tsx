import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ShieldCheck, ShieldOff, ShieldX, Clock } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { formatMinutesRemaining } from "@medchain/domain";

export default function PermissoesScreen() {
  const router = useRouter();
  const { activeTokens, state, revokeToken, pendingRequests } = useAppStore();

  function minutesLeft(expiresAt: Date): number {
    return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60_000));
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
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-500">
              Aguardando resposta
            </Text>
            {pendingRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                onPress={() => router.push({ pathname: "/autorizacao/[id]" as never, params: { id: req.id } })}
                activeOpacity={0.8}
                className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"
                accessibilityLabel={`Responder pedido de ${req.professional.name}`}
                accessibilityRole="button"
              >
                <View className="mb-3 flex-row items-center gap-2">
                  <Clock color="#D97706" size={18} />
                  <Text className="text-sm font-semibold text-amber-700">Pedido pendente</Text>
                </View>
                <Text className="text-base font-bold text-gray-900">{req.professional.name}</Text>
                <Text className="text-sm text-gray-500">{req.professional.crm}</Text>
                <Text className="mb-3 text-sm text-gray-500">{req.professional.institution}</Text>
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
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Acessos ativos
            </Text>
            {activeTokens.map((token) => (
              <View key={token.id} className="mb-3 rounded-2xl bg-white p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <ShieldCheck color="#0F766E" size={20} />
                  <Text className="text-sm font-semibold text-teal-700">
                    Ativo · {formatMinutesRemaining(minutesLeft(token.expiresAt))} restantes
                  </Text>
                </View>
                <Text className="text-base font-bold text-gray-900">{token.professional.name}</Text>
                <Text className="text-sm text-gray-500">{token.professional.crm}</Text>
                <Text className="mb-1 text-sm text-gray-500">{token.professional.institution}</Text>
                <View className="mb-4 self-start rounded-full bg-teal-50 px-3 py-1">
                  <Text className="text-xs text-teal-700">{token.scope}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => revokeToken(token.id)}
                  className="flex-row items-center justify-center gap-2 rounded-xl bg-red-50 py-3"
                  accessibilityLabel={`Revogar acesso de ${token.professional.name}`}
                  accessibilityRole="button"
                >
                  <ShieldOff color="#DC2626" size={16} />
                  <Text className="text-sm font-semibold text-red-600">Revogar acesso</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Acessos encerrados */}
        {state.tokens.filter((t) => t.status !== "ACTIVE").length > 0 && (
          <>
            <Text className="mb-3 mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Acessos encerrados
            </Text>
            {state.tokens
              .filter((t) => t.status !== "ACTIVE")
              .map((token) => (
                <View key={token.id} className="mb-2 flex-row items-center gap-3 rounded-xl bg-white p-4">
                  <ShieldX color="#9CA3AF" size={18} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">{token.professional.name}</Text>
                    <Text className="text-xs text-gray-400">
                      {token.status === "REVOKED" ? "Revogado pelo paciente" : "Expirado"}
                    </Text>
                  </View>
                </View>
              ))}
          </>
        )}

        {activeTokens.length === 0 && pendingRequests.length === 0 && (
          <View className="items-center rounded-2xl bg-white py-12">
            <ShieldCheck color="#9CA3AF" size={40} />
            <Text className="mt-3 text-base font-medium text-gray-500">Nenhum acesso ativo</Text>
            <Text className="text-sm text-gray-400">Seus dados estão protegidos</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
