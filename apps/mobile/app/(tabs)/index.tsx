import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, FileText, ShieldCheck, Stethoscope } from "lucide-react-native";
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
} from "../../src/components";
import { useAppStore } from "../../src/context/AppStore";
import {
  api,
  type MedicalDocumentResponse,
  type PatientProfileResponse,
} from "../../src/services/api";

function getInitials(fullName: string): string {
  const parts = fullName.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function minutesLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000));
}

export default function InicioScreen() {
  const router = useRouter();
  const { activeTokens, pendingRequests, revokeToken, refetch, state } = useAppStore();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [recentDocs, setRecentDocs] = useState<MedicalDocumentResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSideData = useCallback(() => {
    api.getMyProfile().then(setProfile).catch(() => null);
    api
      .getMyDocuments()
      .then((docs) => setRecentDocs(docs.slice(0, 3)))
      .catch(() => null);
  }, []);

  useEffect(() => {
    loadSideData();
  }, [loadSideData]);

  async function onRefresh() {
    setRefreshing(true);
    loadSideData();
    await refetch().catch(() => null);
    setRefreshing(false);
  }

  async function openDocument(docId: string) {
    try {
      const { signedUrl } = await api.getDocumentUrl(docId);
      await Linking.openURL(signedUrl);
    } catch {
      Alert.alert("Não foi possível abrir", "Tente novamente em alguns instantes.");
    }
  }

  // Revogar corta o acesso de um profissional no meio de um atendimento, então
  // pede confirmação e nomeia quem perde o acesso. O botão que dispara isto
  // nunca tem o mesmo peso visual do botão comum.
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

  const firstName = profile?.fullName.split(" ")[0] ?? "";
  const initials = profile ? getInitials(profile.fullName) : "";

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        title={firstName ? `Olá, ${firstName}` : "Olá"}
        subtitle="Você decide quem vê seus dados de saúde, e por quanto tempo."
        trailing={
          <View className="h-11 w-11 items-center justify-center rounded-full border border-interactive-border bg-interactive-subtle">
            <Text className="text-label font-bold text-interactive">{initials}</Text>
          </View>
        }
      />

      {/* 1. Decisão pendente. É o que exige ação e por isso vem antes de tudo. */}
      {pendingRequests.length > 0 && (
        <View className="mb-6 gap-3">
          <SectionHeader
            title="Aguardando sua decisão"
            count={pendingRequests.length}
            description="Um profissional pediu acesso ao seu prontuário."
          />
          {pendingRequests.map((request) => (
            <Surface key={request.id} tone="warning">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-warning-subtle border border-warning-border">
                  <Bell size={18} color={colors.status.warning.fg} />
                </View>
                <View className="flex-1">
                  <Text className="text-card-title font-semibold text-foreground">
                    {request.professional.fullName}
                  </Text>
                  <Text className="text-body-sm text-foreground-secondary">
                    {request.professional.specialty}
                    {request.professional.institution?.name
                      ? ` · ${request.professional.institution.name}`
                      : ""}
                  </Text>
                  <Text className="mt-1 text-caption text-foreground-tertiary">
                    Pede {SCOPE_LABEL[request.scope].toLowerCase()} por{" "}
                    {request.durationMinutes} minutos
                  </Text>
                </View>
              </View>

              <Button
                className="mt-4"
                label="Revisar e decidir"
                variant="primary"
                onPress={() =>
                  router.push({
                    pathname: "/autorizacao/[id]" as never,
                    params: { id: request.id },
                  })
                }
                accessibilityLabel={`Revisar pedido de ${request.professional.fullName}`}
                accessibilityHint="Abre os detalhes para autorizar ou negar"
              />
            </Surface>
          ))}
        </View>
      )}

      {/* 2. Quem está vendo agora. */}
      <View className="mb-6 gap-3">
        <SectionHeader
          title="Quem tem acesso agora"
          count={activeTokens.length}
          description="Acessos válidos neste momento."
        />

        {activeTokens.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={20} color={colors.status.success.fg} />}
            title="Ninguém tem acesso ao seu prontuário"
            description="Quando você autorizar um profissional, ele aparece aqui com o tempo restante."
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
                      {token.professional.institution?.name ??
                        token.professional.specialty}
                    </Text>
                  </View>
                  <StatusBadge tone="active" label="Acesso ativo" />
                </View>

                <View className="mt-3 flex-row items-center gap-1.5">
                  <Stethoscope size={13} color={colors.semantic.textTertiary} />
                  <Text className="text-caption text-foreground-tertiary">
                    {SCOPE_LABEL[token.scope]}
                  </Text>
                </View>

                <AccessCountdown
                  className="mt-3"
                  minutesRemaining={remaining}
                  totalMinutes={total}
                />

                <View className="mt-4 flex-row gap-2">
                  <Button
                    label="Ver detalhes"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    className="flex-1"
                    onPress={() => router.push("/(tabs)/permissoes")}
                    accessibilityLabel={`Ver detalhes do acesso de ${token.professional.fullName}`}
                  />
                  <Button
                    label="Revogar"
                    variant="destructive"
                    size="sm"
                    fullWidth={false}
                    className="flex-1"
                    onPress={() =>
                      confirmRevoke(token.id, token.professional.fullName)
                    }
                    accessibilityLabel={`Revogar acesso de ${token.professional.fullName}`}
                    accessibilityHint="Pede confirmação antes de encerrar"
                  />
                </View>
              </Surface>
            );
          })
        )}
      </View>

      {/* 3. Documentos recentes, como atalho de consulta. */}
      <View className="gap-3">
        <SectionHeader
          title="Documentos recentes"
          action={
            <Pressable
              onPress={() => router.push("/(tabs)/documentos")}
              accessibilityRole="button"
              accessibilityLabel="Ver todos os documentos"
              hitSlop={10}
              className="min-h-touch justify-center"
            >
              <Text className="text-label font-semibold text-interactive">
                Ver todos
              </Text>
            </Pressable>
          }
        />

        {recentDocs.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} color={colors.semantic.textTertiary} />}
            title="Nenhum documento ainda"
            description={
              state.loading
                ? "Carregando seus documentos…"
                : "Envie exames e laudos pela aba Documentos."
            }
          />
        ) : (
          <Surface padded={false} className="overflow-hidden">
            {recentDocs.map((doc, index) => (
              <View key={doc.id}>
                {index > 0 && <RowDivider />}
                <ListRow
                  title={doc.title}
                  subtitle={formatDate(doc.issuedAt)}
                  onPress={() => openDocument(doc.id)}
                  accessibilityLabel={`Abrir ${doc.title}, de ${formatDate(doc.issuedAt)}`}
                  chevron
                  leading={
                    <View className="h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-subtle">
                      <FileText size={16} color={colors.semantic.textSecondary} />
                    </View>
                  }
                />
              </View>
            ))}
          </Surface>
        )}
      </View>
    </Screen>
  );
}
