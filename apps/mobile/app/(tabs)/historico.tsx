import { useState } from "react";
import { RefreshControl, View } from "react-native";
import {
  Activity,
  FileText,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import {
  EmptyState,
  Screen,
  ScreenHeader,
  SectionHeader,
  Surface,
  Text,
} from "../../src/components";
import { useAppStore } from "../../src/context/AppStore";
import type { AuditLogResponse } from "../../src/services/api";

// Mesmo vocabulário do portal (apps/web/components/medchain/activity-timeline.tsx):
// o histórico do paciente não pode contar uma história diferente da do médico.
const EVENT: Record<
  string,
  { label: string; icon: LucideIcon; tone: string; color: string }
> = {
  ACCESS: {
    label: "Prontuário acessado",
    icon: FileText,
    tone: "bg-info-subtle",
    color: colors.status.info.fg,
  },
  APPROVE: {
    label: "Acesso autorizado",
    icon: ShieldCheck,
    tone: "bg-success-subtle",
    color: colors.status.success.fg,
  },
  DENY: {
    label: "Acesso negado",
    icon: ShieldX,
    tone: "bg-danger-subtle",
    color: colors.status.danger.fg,
  },
  REVOKE: {
    label: "Acesso revogado",
    icon: ShieldOff,
    tone: "bg-surface-subtle",
    color: colors.semantic.textSecondary,
  },
  REQUEST: {
    label: "Acesso solicitado",
    icon: Activity,
    tone: "bg-surface-subtle",
    color: colors.semantic.textSecondary,
  },
  CONTACT_APPROVE: {
    label: "Contato de emergência aceito",
    icon: UserCheck,
    tone: "bg-success-subtle",
    color: colors.status.success.fg,
  },
  CONTACT_DENY: {
    label: "Contato de emergência recusado",
    icon: UserX,
    tone: "bg-danger-subtle",
    color: colors.status.danger.fg,
  },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimelineItem({
  log,
  isLast,
}: {
  log: AuditLogResponse;
  isLast: boolean;
}) {
  const config = EVENT[log.eventType];
  const Icon = config?.icon ?? Activity;
  const professional = log.token?.professional;

  return (
    <View
      accessible
      accessibilityLabel={`${config?.label ?? log.eventType}${
        professional ? `, por ${professional.fullName}` : ""
      }, em ${formatDateTime(log.createdAt)}`}
      className="flex-row gap-3"
    >
      <View className="items-center">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            config?.tone ?? "bg-surface-subtle"
          }`}
        >
          <Icon size={15} color={config?.color ?? colors.semantic.textSecondary} />
        </View>
        {/* Fio que liga os eventos. Decorativo. */}
        {!isLast && <View className="w-px flex-1 bg-border" />}
      </View>

      <View className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
        <Text className="text-body font-semibold text-foreground">
          {config?.label ?? log.eventType}
        </Text>
        {professional ? (
          <Text className="text-body-sm text-foreground-secondary">
            {professional.fullName} · CRM {professional.crm}
          </Text>
        ) : null}
        <Text className="text-caption text-foreground-tertiary">
          {formatDateTime(log.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function HistoricoScreen() {
  const { state, refetch } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch().catch(() => null);
    setRefreshing(false);
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        title="Histórico"
        subtitle="Registro completo do que aconteceu com o seu prontuário. Nada é apagado."
      />

      {state.loading && state.logs.length === 0 ? (
        <Text className="text-body-sm text-foreground-tertiary">
          Carregando seu histórico…
        </Text>
      ) : state.logs.length === 0 ? (
        <EmptyState
          icon={<Activity size={20} color={colors.semantic.textTertiary} />}
          title="Sem eventos registrados"
          description="Pedidos, autorizações e acessos ao seu prontuário aparecem aqui."
        />
      ) : (
        <View className="gap-3">
          <SectionHeader title="Todos os eventos" count={state.logs.length} />
          <Surface>
            {state.logs.map((log, index) => (
              <TimelineItem
                key={log.id}
                log={log}
                isLast={index === state.logs.length - 1}
              />
            ))}
          </Surface>
        </View>
      )}
    </Screen>
  );
}
