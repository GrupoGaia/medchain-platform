import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { ShieldCheck, ShieldOff, ShieldX, Activity } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import type { AuditLogResponse } from "../../src/services/api";
import { colors } from "@medchain/ui-tokens";

function formatEventType(eventType: string): string {
  const map: Record<string, string> = {
    ACCESS: "Prontuário acessado",
    APPROVE: "Acesso autorizado",
    DENY: "Acesso negado",
    REVOKE: "Acesso revogado",
    REQUEST: "Acesso solicitado",
  };
  return map[eventType] ?? eventType;
}

function EventIcon({ eventType }: { eventType: string }) {
  switch (eventType) {
    case "APPROVE":
      return <ShieldCheck color={colors.brand[700]} size={16} />;
    case "DENY":
      return <ShieldX color={colors.alert.red} size={16} />;
    case "REVOKE":
      return <ShieldOff color={colors.neutral.muted} size={16} />;
    default:
      return <Activity color={colors.alert.info} size={16} />;
  }
}

function iconBg(eventType: string): string {
  switch (eventType) {
    case "APPROVE":
      return "bg-brand-50";
    case "DENY":
    case "REVOKE":
      return "bg-red-50";
    default:
      return "bg-indigo-50";
  }
}

function LogRow({ log }: { log: AuditLogResponse }) {
  return (
    <View className="mb-2 flex-row items-start gap-3 rounded-xl bg-white p-4">
      <View className={`mt-0.5 h-8 w-8 items-center justify-center rounded-lg ${iconBg(log.eventType)}`}>
        <EventIcon eventType={log.eventType} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900">
          {formatEventType(log.eventType)}
        </Text>
        {log.token && (
          <Text className="text-xs text-gray-500">
            {log.token.professional.fullName} · {log.token.professional.crm}
          </Text>
        )}
        <Text className="text-xs text-gray-400">
          {new Date(log.createdAt).toLocaleString("pt-BR")}
        </Text>
      </View>
    </View>
  );
}

export default function HistoricoScreen() {
  const { state } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Meu Histórico</Text>

        {state.loading && (
          <Text className="text-center text-sm text-gray-400">Carregando...</Text>
        )}

        {!state.loading && state.logs.length === 0 && (
          <View className="items-center rounded-2xl bg-white py-12">
            <Activity color={colors.neutral.muted} size={40} />
            <Text className="mt-3 text-base font-medium text-gray-500">
              Sem eventos registrados
            </Text>
            <Text className="text-sm text-gray-400">
              Os acessos ao seu prontuário aparecerão aqui
            </Text>
          </View>
        )}

        {state.logs.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Acessos ao prontuário
            </Text>
            {state.logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
