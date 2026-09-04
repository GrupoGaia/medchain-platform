import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ShieldCheck,
  ShieldX,
  User,
  Clock,
  AlertTriangle,
  Check,
  X,
} from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { colors } from "@medchain/ui-tokens";
import { SCOPE_LABEL, SCOPE_SHARES, SCOPE_WITHHOLDS } from "@medchain/domain";

export default function AutorizacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, approveRequest, denyRequest } = useAppStore();

  const request = state.accessRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Pedido não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const isResolved = request.status !== "PENDING";

  function handleApprove() {
    Alert.alert(
      "Confirmar autorização",
      `Autorizar acesso de ${request!.professional.fullName} por ${request!.durationMinutes} minutos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Autorizar",
          style: "default",
          onPress: () => {
            approveRequest(request!.id);
            router.replace("/(tabs)/permissoes");
          },
        },
      ]
    );
  }

  function handleDeny() {
    Alert.alert(
      "Negar acesso",
      `Tem certeza que deseja negar o acesso de ${request!.professional.fullName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Negar",
          style: "destructive",
          onPress: () => {
            denyRequest(request!.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Institucional */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-5 py-3.5 shadow-2xs">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="flex-row items-center py-1"
        >
          <Text className="text-sm font-semibold text-brand-700">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">Solicitação de Acesso</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Card do Médico Solicitante */}
        <View className="mb-4 flex-row items-center gap-3.5 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-brand-100 bg-brand-50">
            <User color={colors.brand[700]} size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">
              {request.professional.fullName}
            </Text>
            <Text className="text-xs text-gray-500">
              CRM {request.professional.crm} · {request.professional.specialty}
            </Text>
            {request.professional.institution?.name && (
              <Text className="mt-0.5 text-xs font-semibold text-brand-800">
                {request.professional.institution.name}
              </Text>
            )}
          </View>
        </View>

        {/* Detalhes da Solicitação */}
        <View className="mb-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs">
          <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Parâmetros do acesso
          </Text>

          <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
            <View className="flex-row items-center gap-2.5">
              <Clock color={colors.brand[700]} size={16} />
              <Text className="text-xs text-gray-600">Duração solicitada</Text>
            </View>
            <View className="rounded-md bg-gray-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-gray-800">
                {request.durationMinutes} minutos
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-3">
            <View className="flex-row items-center gap-2.5">
              <ShieldCheck color={colors.brand[700]} size={16} />
              <Text className="text-xs text-gray-600">Escopo de dados</Text>
            </View>
            <View className="rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-brand-800">
                {SCOPE_LABEL[request.scope]}
              </Text>
            </View>
          </View>

          {/* Motivo */}
          {request.reason && (
            <View className="mt-3.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
              <View className="mb-1 flex-row items-center gap-1.5">
                <AlertTriangle color={colors.alert.amber} size={14} />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Motivo informado
                </Text>
              </View>
              <Text className="text-xs font-medium text-amber-950">{request.reason}</Text>
            </View>
          )}
        </View>

        {/* Detalhamento de Soberania (O que pode ver / Não pode ver) */}
        <View className="mb-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            O médico poderá visualizar
          </Text>
          <View className="gap-2">
            {SCOPE_SHARES[request.scope].map((item) => (
              <View key={item} className="flex-row items-center gap-2">
                <View className="h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={10} color={colors.alert.green} />
                </View>
                <Text className="text-xs font-medium text-gray-800">{item}</Text>
              </View>
            ))}
          </View>

          {SCOPE_WITHHOLDS[request.scope].length > 0 && (
            <View className="mt-4 border-t border-gray-100 pt-3">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Permanecerá privado (Não compartilhado)
              </Text>
              <View className="gap-2">
                {SCOPE_WITHHOLDS[request.scope].map((item) => (
                  <View key={item} className="flex-row items-center gap-2">
                    <View className="h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                      <X size={10} color={colors.neutral.muted} />
                    </View>
                    <Text className="text-xs text-gray-400">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Aviso de segurança */}
        <Text className="mb-6 px-3 text-center text-xs text-gray-400">
          O acesso é auditado e expira automaticamente após o período. Você pode revogá-lo a qualquer momento.
        </Text>

        {/* Botões de ação */}
        {isResolved ? (
          <View className="items-center rounded-2xl bg-gray-100 p-5">
            <Text className="text-base font-semibold text-gray-700">
              {request.status === "APPROVED" ? "Acesso autorizado" : "Acesso negado"}
            </Text>
            <Text className="mt-1 text-xs text-gray-400">Este pedido já foi respondido.</Text>
          </View>
        ) : (
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleApprove}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2.5 rounded-2xl bg-brand-600 py-4 shadow-sm active:bg-brand-700"
              accessibilityLabel="Autorizar acesso"
              accessibilityRole="button"
            >
              <ShieldCheck color="#fff" size={20} />
              <Text className="text-base font-bold text-white">Autorizar Acesso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeny}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 shadow-2xs active:bg-gray-50"
              accessibilityLabel="Negar acesso"
              accessibilityRole="button"
            >
              <ShieldX color={colors.neutral.subtle} size={18} />
              <Text className="text-sm font-semibold text-gray-700">Negar Acesso</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


