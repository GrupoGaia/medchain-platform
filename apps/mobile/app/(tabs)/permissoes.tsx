import { useState } from "react";
import { Alert, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { ShieldCheck, Clock, FileLock2, Building2 } from "lucide-react-native";
import { SCOPE_LABEL, tokenTotalMinutes } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import {
  AccessCountdown,
  Button,
  EmptyState,
  ListRow,
  RowDivider,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatusBadge,
  Surface,
  Text,
  toneForTokenStatus,
} from "../../src/components";
import { useAppStore } from "../../src/context/AppStore";

function minutesLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PermissoesScreen() {
  const router = useRouter();
  const { activeTokens, state, revokeToken, pendingRequests, refetch } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const closedTokens = state.tokens.filter((token) => token.status !== "ACTIVE");

  async function onRefresh() {
    setRefreshing(true);
    await refetch().catch(() => null);
    setRefreshing(false);
  }

  function confirmRevoke(tokenId: string, professionalName: string) {
    Alert.alert(
      "Revogar acesso?",
      `${professionalName} deixa de ver seus dados imediatamente. Para liberar de novo será preciso um novo pedido.`,
      [
        { text: "Manter acesso", style: "cancel" },
        {
          text: "Revogar",
          style: "destructive",
          onPress: () => {
            revokeToken(tokenId).catch(() =>
              Alert.alert("Não foi possível revogar", "Tente novamente.")
            );
          },
        },
      ]
    );
  }

  const nothingToShow =
    activeTokens.length === 0 &&
    pendingRequests.length === 0 &&
    closedTokens.length === 0;

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        title="Permissões"
        subtitle="Central de privacidade: quem pediu, quem tem acesso agora e o que já foi encerrado."
      />

      {/* Pedidos aguardando decisão. */}
      {pendingRequests.length > 0 && (
        <View className="mb-6 gap-3">
          <SectionHeader
            title="Aguardando sua decisão"
            count={pendingRequests.length}
          />
          {pendingRequests.map((request) => (
            <Surface key={request.id} tone="warning">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-card-title font-semibold text-foreground">
                    {request.professional.fullName}
                  </Text>
                  <Text className="text-body-sm text-foreground-secondary">
                    CRM {request.professional.crm} · {request.professional.specialty}
                  </Text>
                  {request.professional.institution?.name ? (
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <Building2 size={13} color={colors.semantic.textTertiary} />
                      <Text className="text-caption text-foreground-tertiary">
                        {request.professional.institution.name}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <StatusBadge tone="pending" label="Aguardando você" />
              </View>

              <View className="mt-3 flex-row items-center gap-1.5">
                <FileLock2 size={13} color={colors.semantic.textTertiary} />
                <Text className="text-caption text-foreground-tertiary">
                  {SCOPE_LABEL[request.scope]} · {request.durationMinutes} minutos
                </Text>
              </View>

              <Button
                className="mt-4"
                label="Revisar e decidir"
                onPress={() =>
                  router.push({
                    pathname: "/autorizacao/[id]" as never,
                    params: { id: request.id },
                  })
                }
                accessibilityLabel={`Revisar pedido de ${request.professional.fullName}`}
              />
            </Surface>
          ))}
        </View>
      )}

      {/* Acessos ativos. */}
      <View className="mb-6 gap-3">
        <SectionHeader
          title="Acessos ativos"
          count={activeTokens.length}
          description="Profissionais que podem abrir seu prontuário agora."
        />

        {activeTokens.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={20} color={colors.status.success.fg} />}
            title="Nenhum acesso ativo"
            description="Seu prontuário está fechado para todos os profissionais."
          />
        ) : (
          activeTokens.map((token) => {
            const remaining = minutesLeft(token.expiresAt);
            const total = tokenTotalMinutes({
              createdAt: new Date(token.createdAt),
              expiresAt: new Date(token.expiresAt),
            });

            return (
              <Surface key={token.id}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-card-title font-semibold text-foreground">
                      {token.professional.fullName}
                    </Text>
                    <Text className="text-body-sm text-foreground-secondary">
                      CRM {token.professional.crm} · {token.professional.specialty}
                    </Text>
                    {token.professional.institution?.name ? (
                      <View className="mt-1 flex-row items-center gap-1.5">
                        <Building2 size={13} color={colors.semantic.textTertiary} />
                        <Text className="text-caption text-foreground-tertiary">
                          {token.professional.institution.name}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <StatusBadge tone="active" />
                </View>

                <View className="mt-3 flex-row items-center gap-1.5">
                  <FileLock2 size={13} color={colors.semantic.textTertiary} />
                  <Text className="text-caption text-foreground-tertiary">
                    {SCOPE_LABEL[token.scope]}
                  </Text>
                </View>

                <AccessCountdown
                  className="mt-3"
                  minutesRemaining={remaining}
                  totalMinutes={total}
                />
                <Text className="mt-1 text-caption text-foreground-tertiary">
                  Encerra em {formatDateTime(token.expiresAt)}
                </Text>

                <Button
                  className="mt-4"
                  label="Revogar acesso"
                  variant="destructive"
                  onPress={() => confirmRevoke(token.id, token.professional.fullName)}
                  accessibilityLabel={`Revogar acesso de ${token.professional.fullName}`}
                  accessibilityHint="Pede confirmação antes de encerrar"
                />
              </Surface>
            );
          })
        )}
      </View>

      {/* Histórico de acessos encerrados. */}
      {closedTokens.length > 0 && (
        <View className="gap-3">
          <SectionHeader
            title="Acessos encerrados"
            count={closedTokens.length}
            description="Autorizações que expiraram ou que você revogou."
          />
          <Surface padded={false} className="overflow-hidden">
            {closedTokens.map((token, index) => (
              <View key={token.id}>
                {index > 0 && <RowDivider />}
                <ListRow
                  title={token.professional.fullName}
                  subtitle={SCOPE_LABEL[token.scope]}
                  detail={`Encerrado em ${formatDateTime(
                    token.revokedAt ?? token.expiresAt
                  )}`}
                  trailing={
                    <StatusBadge
                      tone={toneForTokenStatus(token.status)}
                      label={
                        token.status === "REVOKED" ? "Revogado" : "Expirado"
                      }
                    />
                  }
                />
              </View>
            ))}
          </Surface>
        </View>
      )}

      {nothingToShow && !state.loading && (
        <EmptyState
          icon={<Clock size={20} color={colors.semantic.textTertiary} />}
          title="Nada por aqui ainda"
          description="Quando um profissional pedir acesso ao seu prontuário, o pedido aparece nesta tela."
        />
      )}
    </Screen>
  );
}
