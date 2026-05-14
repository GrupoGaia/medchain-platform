import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShieldCheck, ShieldX, User, Clock, Building2, Stethoscope, AlertTriangle } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";

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
      `Autorizar acesso de ${request!.professional.name} por ${request!.durationMinutes} minutos?`,
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
      `Tem certeza que deseja negar o acesso de ${request!.professional.name}?`,
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
      {/* Header estilo WhatsApp */}
      <View className="bg-teal-700 px-5 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-3 self-start"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text className="text-teal-100 text-base">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Pedido de acesso</Text>
        <Text className="text-teal-100 text-sm mt-1">MedChain — Canal seguro</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Card da mensagem */}
        <View className="mb-4 rounded-2xl bg-white overflow-hidden shadow-sm">
          {/* Cabeçalho da mensagem */}
          <View className="bg-teal-50 px-5 py-4 border-b border-teal-100">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-600">
                <User color="#fff" size={22} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">
                  {request.professional.name}
                </Text>
                <Text className="text-sm text-gray-500">{request.professional.crm}</Text>
              </View>
            </View>
          </View>

          {/* Detalhes */}
          <View className="px-5 py-4 gap-4">
            <View className="flex-row items-start gap-3">
              <Building2 color="#0F766E" size={18} />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Instituição</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {request.professional.institution}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <Stethoscope color="#0F766E" size={18} />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Especialidade</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {request.professional.specialty}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <Clock color="#0F766E" size={18} />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Duração do acesso</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {request.durationMinutes} minutos
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <ShieldCheck color="#0F766E" size={18} />
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">Dados solicitados</Text>
                <Text className="text-sm font-medium text-gray-900">{request.scope}</Text>
              </View>
            </View>
          </View>

          {/* Motivo */}
          <View className="mx-5 mb-5 rounded-xl bg-amber-50 border border-amber-100 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <AlertTriangle color="#D97706" size={14} />
              <Text className="text-xs font-semibold text-amber-700">Motivo informado</Text>
            </View>
            <Text className="text-sm text-amber-900">{request.reason}</Text>
          </View>
        </View>

        {/* Aviso de segurança */}
        <Text className="text-xs text-center text-gray-400 mb-6 px-4">
          Ao autorizar, o profissional terá acesso temporário e auditado aos dados selecionados.
          Você pode revogar a qualquer momento.
        </Text>

        {/* Botões de ação */}
        {isResolved ? (
          <View className="rounded-2xl bg-gray-100 p-5 items-center">
            <Text className="text-base font-semibold text-gray-600">
              {request.status === "APPROVED" ? "Acesso autorizado" : "Acesso negado"}
            </Text>
            <Text className="text-sm text-gray-400 mt-1">Este pedido já foi respondido.</Text>
          </View>
        ) : (
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleApprove}
              activeOpacity={0.8}
              className="flex-row items-center justify-center gap-3 rounded-2xl bg-teal-600 py-5"
              accessibilityLabel="Autorizar acesso"
              accessibilityRole="button"
            >
              <ShieldCheck color="#fff" size={22} />
              <Text className="text-lg font-bold text-white">SIM, autorizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeny}
              activeOpacity={0.8}
              className="flex-row items-center justify-center gap-3 rounded-2xl bg-red-50 border border-red-200 py-5"
              accessibilityLabel="Negar acesso"
              accessibilityRole="button"
            >
              <ShieldX color="#DC2626" size={22} />
              <Text className="text-lg font-bold text-red-600">NÃO, negar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
