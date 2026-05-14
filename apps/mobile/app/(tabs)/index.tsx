import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Shield, FileText, Bell } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { MOCK_PATIENT, MOCK_DOCUMENTS } from "../../src/services/mocks/data";
import { formatMinutesRemaining } from "@medchain/domain";

export default function InicioScreen() {
  const router = useRouter();
  const { activeTokens, pendingRequests, revokeToken } = useAppStore();
  const patient = MOCK_PATIENT;
  const recentDocs = MOCK_DOCUMENTS.slice(0, 3);

  function minutesLeft(expiresAt: Date): number {
    return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60_000));
  }

  return (
    <SafeAreaView className="flex-1 bg-teal-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>

        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Olá, {patient.name.split(" ")[0]}
            </Text>
            <Text className="text-sm text-gray-500">Seus dados estão seguros</Text>
          </View>
          <View className="relative">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-600">
              <Text className="text-lg font-bold text-white">{patient.initials}</Text>
            </View>
            {pendingRequests.length > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-bold text-white">{pendingRequests.length}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Banner de pedido pendente */}
        {pendingRequests.map((req) => (
          <TouchableOpacity
            key={req.id}
            onPress={() => router.push({ pathname: "/autorizacao/[id]" as never, params: { id: req.id } })}
            activeOpacity={0.8}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
            accessibilityLabel={`Pedido de acesso pendente de ${req.professional.name}`}
            accessibilityRole="button"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Bell color="#D97706" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-amber-900">Pedido de acesso pendente</Text>
              <Text className="text-xs text-amber-700">
                {req.professional.name} · {req.professional.institution}
              </Text>
            </View>
            <Text className="text-lg text-amber-600">›</Text>
          </TouchableOpacity>
        ))}

        {/* CTA principal */}
        <TouchableOpacity
          className="mb-4 w-full items-center rounded-2xl bg-teal-600 px-6 py-5"
          activeOpacity={0.8}
          accessibilityLabel="Gerar token de acesso"
          accessibilityRole="button"
        >
          <Shield color="#fff" size={28} />
          <Text className="mt-2 text-lg font-semibold text-white">Gerar Token de Acesso</Text>
          <Text className="text-sm text-teal-100">Autorize um profissional de saúde</Text>
        </TouchableOpacity>

        {/* Acessos ativos */}
        {activeTokens.map((token) => (
          <View key={token.id} className="mb-4 rounded-2xl border border-teal-200 bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-teal-700">Acesso ativo</Text>
              <View className="rounded-full bg-teal-100 px-3 py-1">
                <Text className="text-xs font-medium text-teal-700">
                  {formatMinutesRemaining(minutesLeft(token.expiresAt))} restantes
                </Text>
              </View>
            </View>
            <Text className="text-base font-semibold text-gray-900">{token.professional.name}</Text>
            <Text className="text-sm text-gray-500">{token.professional.institution}</Text>
            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/permissoes")}
                className="flex-1 rounded-lg border border-gray-200 py-2"
                accessibilityLabel="Ver detalhes do acesso"
              >
                <Text className="text-center text-sm text-gray-600">Detalhes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => revokeToken(token.id)}
                className="flex-1 rounded-lg bg-red-50 py-2"
                accessibilityLabel={`Revogar acesso de ${token.professional.name}`}
              >
                <Text className="text-center text-sm font-medium text-red-600">Revogar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {activeTokens.length === 0 && pendingRequests.length === 0 && (
          <View className="mb-4 items-center rounded-2xl bg-white p-5">
            <Shield color="#9CA3AF" size={32} />
            <Text className="mt-2 text-sm text-gray-400">Nenhum acesso ativo</Text>
          </View>
        )}

        {/* Exames recentes */}
        <Text className="mb-3 text-base font-semibold text-gray-900">Exames recentes</Text>
        {recentDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            className="mb-2 flex-row items-center rounded-xl bg-white p-4"
            accessibilityLabel={`${doc.title}, ${doc.issuedAt}`}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <FileText color="#0F766E" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{doc.title}</Text>
              <Text className="text-xs text-gray-400">{doc.issuedAt}</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
