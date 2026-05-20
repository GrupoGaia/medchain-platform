import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Shield, FileText, Bell } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { api, type PatientProfileResponse, type MedicalDocumentResponse } from "../../src/services/api";
import { formatMinutesRemaining } from "@medchain/domain";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function InicioScreen() {
  const router = useRouter();
  const { activeTokens, pendingRequests, revokeToken } = useAppStore();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [recentDocs, setRecentDocs] = useState<MedicalDocumentResponse[]>([]);

  useEffect(() => {
    api.getMyProfile().then(setProfile).catch(() => null);
    api
      .getMyDocuments()
      .then((docs) => setRecentDocs(docs.slice(0, 3)))
      .catch(() => null);
  }, []);

  function minutesLeft(expiresAt: string): number {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
  }

  const firstName = profile?.fullName.split(" ")[0] ?? "...";
  const initials = profile ? getInitials(profile.fullName) : "...";

  return (
    <SafeAreaView className="flex-1 bg-teal-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Olá, {firstName}</Text>
            <Text className="text-sm text-gray-500">Seus dados estão seguros</Text>
          </View>
          <View className="relative">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-600">
              <Text className="text-lg font-bold text-white">{initials}</Text>
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
            onPress={() =>
              router.push({ pathname: "/autorizacao/[id]" as never, params: { id: req.id } })
            }
            activeOpacity={0.8}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
            accessibilityLabel={`Pedido de acesso pendente de ${req.professional.fullName}`}
            accessibilityRole="button"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Bell color="#D97706" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-amber-900">Pedido de acesso pendente</Text>
              <Text className="text-xs text-amber-700">
                {req.professional.fullName} · {req.professional.institution?.name ?? ""}
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
            <Text className="text-base font-semibold text-gray-900">{token.professional.fullName}</Text>
            <Text className="text-sm text-gray-500">{token.professional.institution?.name ?? ""}</Text>
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
                accessibilityLabel={`Revogar acesso de ${token.professional.fullName}`}
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
        {recentDocs.length === 0 && (
          <Text className="text-sm text-gray-400">Nenhum documento encontrado</Text>
        )}
        {recentDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            className="mb-2 flex-row items-center rounded-xl bg-white p-4"
            accessibilityLabel={`${doc.title}, ${formatDate(doc.issuedAt)}`}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <FileText color="#0F766E" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{doc.title}</Text>
              <Text className="text-xs text-gray-400">{formatDate(doc.issuedAt)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
