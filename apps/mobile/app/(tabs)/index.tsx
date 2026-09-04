import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, SafeAreaView, Linking, Alert } from "react-native";
import { Text } from "../../src/components";
import { useRouter } from "expo-router";
import { Shield, FileText, Bell } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { api, type PatientProfileResponse, type MedicalDocumentResponse } from "../../src/services/api";
import { formatMinutesRemaining, tokenTotalMinutes } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";

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

  async function openDocument(docId: string) {
    try {
      const { signedUrl } = await api.getDocumentUrl(docId);
      await Linking.openURL(signedUrl);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o documento.");
    }
  }

  const firstName = profile?.fullName.split(" ")[0] ?? "...";
  const initials = profile ? getInitials(profile.fullName) : "...";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Olá, {firstName}</Text>
            <Text className="text-xs font-medium text-slate-500">Seus dados de saúde estão protegidos</Text>
          </View>
          <View className="relative">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-600 shadow-sm">
              <Text className="text-base font-bold text-white">{initials}</Text>
            </View>
            {pendingRequests.length > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-xs">
                <Text className="text-[10px] font-bold text-white">{pendingRequests.length}</Text>
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
            activeOpacity={0.85}
            className="mb-4 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-4 shadow-xs"
            accessibilityLabel={`Pedido de acesso pendente de ${req.professional.fullName}`}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Bell color={colors.alert.amber} size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Pedido de acesso pendente
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {req.professional.fullName}
                </Text>
                <Text className="text-xs text-slate-600">
                  {req.professional.specialty} · {req.professional.institution?.name ?? ""}
                </Text>
              </View>
            </View>
            <View className="mt-3.5 w-full items-center justify-center rounded-xl bg-amber-600 py-2.5 shadow-2xs">
              <Text className="text-xs font-bold text-white">Revisar e Autorizar</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Acessos ativos */}
        {activeTokens.length > 0 && (
          <View className="mb-2">
            <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
              Acessos ativos no momento
            </Text>
            {activeTokens.map((token) => {
              const leftMin = minutesLeft(token.expiresAt);
              // A duracao concedida varia de 15 minutos a 8 horas. Sem dividir
              // pelo total do proprio token, a barra so ficava certa em 60 min.
              const totalMin = tokenTotalMinutes({
                createdAt: new Date(token.createdAt),
                expiresAt: new Date(token.expiresAt),
              });
              const progress = Math.min(100, Math.max(8, Math.round((leftMin / totalMin) * 100)));

              return (
                <View
                  key={token.id}
                  className="mb-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
                >
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                      <View className="h-2 w-2 rounded-full bg-emerald-500" />
                      <Text className="text-xs font-bold uppercase tracking-wider text-teal-800">
                        Acesso ativo
                      </Text>
                    </View>
                    <View className="rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5">
                      <Text className="text-xs font-bold text-teal-800">
                        {formatMinutesRemaining(leftMin)} restantes
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-slate-900">
                    {token.professional.fullName}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {token.professional.institution?.name ?? "Instituição de Saúde"}
                  </Text>

                  {/* Barra de progresso visual */}
                  <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <View
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${progress}%` }}
                    />
                  </View>

                  <View className="mt-3.5 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/permissoes")}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 active:bg-slate-50"
                      accessibilityLabel="Ver detalhes do acesso"
                    >
                      <Text className="text-center text-xs font-semibold text-slate-700">
                        Ver detalhes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => revokeToken(token.id)}
                      className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 active:bg-rose-100"
                      accessibilityLabel={`Revogar acesso de ${token.professional.fullName}`}
                    >
                      <Text className="text-center text-xs font-bold text-rose-600">
                        Revogar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTokens.length === 0 && pendingRequests.length === 0 && (
          <View className="mb-5 items-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <View className="mb-2.5 h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Shield color={colors.brand[600]} size={24} />
            </View>
            <Text className="text-sm font-bold text-slate-900">Seus dados estão protegidos</Text>
            <Text className="mt-0.5 text-center text-xs text-slate-500">
              Nenhum médico possui acesso ativo ao seu prontuário neste momento.
            </Text>
          </View>
        )}

        {/* Documentos recentes */}
        <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          Documentos recentes
        </Text>
        {recentDocs.length === 0 && (
          <Text className="text-xs text-slate-400">Nenhum documento encontrado</Text>
        )}
        {recentDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            onPress={() => openDocument(doc.id)}
            className="mb-2 flex-row items-center rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs active:bg-slate-50"
            accessibilityLabel={`Abrir ${doc.title}, ${formatDate(doc.issuedAt)}`}
            accessibilityRole="button"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <FileText color={colors.brand[700]} size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900">{doc.title}</Text>
              <Text className="text-xs text-slate-400">{formatDate(doc.issuedAt)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
