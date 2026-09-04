import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, SectionLabel, Text } from "../../src/components";
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
    CONTACT_APPROVE: "Contato de emergência aceito",
    CONTACT_DENY: "Contato de emergência recusado",
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
          <Card className="py-12">
            <EmptyState
              icon={<Activity color={colors.neutral.muted} size={40} />}
              title="Sem eventos registrados"
              description="Os acessos ao seu prontuário aparecerão aqui"
            />
          </Card>
        )}

        {state.logs.length > 0 && (
          <>
            <SectionLabel>
              Acessos ao prontuário
            </SectionLabel>
            {state.logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
