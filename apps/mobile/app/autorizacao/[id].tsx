import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  X,
  Building2,
  Clock,
  FileLock2,
  MessageSquareQuote,
  ShieldCheck,
  EyeOff,
  Stethoscope,
} from "lucide-react-native";
import {
  SCOPE_LABEL,
  SCOPE_SHARES,
  SCOPE_WITHHOLDS,
  formatMinutesRemaining,
} from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import {
  Button,
  ScreenHeader,
  StatusBadge,
  Surface,
  Text,
} from "../../src/components";
import { useAppStore } from "../../src/context/AppStore";

export default function AutorizacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, approveRequest, denyRequest } = useAppStore();
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);

  const request = state.accessRequests.find((item) => item.id === id);

  if (!request) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-card-title font-semibold text-foreground">
          Pedido não encontrado
        </Text>
        <Text className="mt-1 text-center text-body-sm text-foreground-tertiary">
          Ele pode ter sido cancelado pelo profissional ou já respondido em outro
          aparelho.
        </Text>
        <Button
          className="mt-6"
          label="Voltar"
          variant="outline"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const isResolved = request.status !== "PENDING";
  const professional = request.professional;
  const scope = request.scope;

  // Aprovar cria o token na hora, então a confirmação é o último ponto em que
  // dá para desistir. Negar também confirma: um toque errado aqui manda o
  // profissional de volta para o começo do fluxo.
  function handleApprove() {
    Alert.alert(
      "Autorizar acesso?",
      `${professional.fullName} poderá ver ${SCOPE_LABEL[
        scope
      ].toLowerCase()} pelos próximos ${formatMinutesRemaining(
        request!.durationMinutes
      )}. Você pode revogar antes disso quando quiser.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Autorizar",
          onPress: async () => {
            setSubmitting("approve");
            try {
              await approveRequest(request!.id);
              router.replace("/(tabs)/permissoes");
            } catch {
              Alert.alert("Não foi possível autorizar", "Tente novamente.");
            } finally {
              setSubmitting(null);
            }
          },
        },
      ]
    );
  }

  function handleDeny() {
    Alert.alert(
      "Negar acesso?",
      `${professional.fullName} não verá nenhum dado do seu prontuário. Ele pode enviar um novo pedido depois.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Negar",
          style: "destructive",
          onPress: async () => {
            setSubmitting("deny");
            try {
              await denyRequest(request!.id);
              router.back();
            } catch {
              Alert.alert("Não foi possível negar", "Tente novamente.");
            } finally {
              setSubmitting(null);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
      >
        <ScreenHeader
          title="Pedido de acesso"
          subtitle="Confira quem está pedindo e o que será compartilhado antes de decidir."
          onBack={() => router.back()}
        />

        {/* Quem está pedindo. */}
        <Surface className="mb-3">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full border border-interactive-border bg-interactive-subtle">
              <Stethoscope size={20} color={colors.semantic.interactive} />
            </View>
            <View className="flex-1">
              <Text className="text-card-title font-semibold text-foreground">
                {professional.fullName}
              </Text>
              <Text className="text-body-sm text-foreground-secondary">
                CRM {professional.crm} · {professional.specialty}
              </Text>
              {professional.institution?.name ? (
                <View className="mt-1.5 flex-row items-center gap-1.5">
                  <Building2 size={13} color={colors.semantic.textTertiary} />
                  <Text className="text-caption text-foreground-tertiary">
                    {professional.institution.name}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Surface>

        {/* Parâmetros do acesso. */}
        <Surface className="mb-3">
          <Text className="text-overline font-semibold uppercase text-foreground-tertiary">
            O que está sendo pedido
          </Text>

          <View
            accessible
            accessibilityLabel={`Escopo: ${SCOPE_LABEL[scope]}`}
            className="mt-3 flex-row items-center justify-between gap-3 border-b border-border-subtle pb-3"
          >
            <View className="flex-row items-center gap-2">
              <FileLock2 size={15} color={colors.semantic.textSecondary} />
              <Text className="text-body-sm text-foreground-secondary">Escopo</Text>
            </View>
            <Text className="flex-1 text-right text-body-sm font-semibold text-foreground">
              {SCOPE_LABEL[scope]}
            </Text>
          </View>

          <View
            accessible
            accessibilityLabel={`Duração: ${formatMinutesRemaining(
              request.durationMinutes
            )}, contados a partir da autorização`}
            className="flex-row items-center justify-between gap-3 pt-3"
          >
            <View className="flex-row items-center gap-2">
              <Clock size={15} color={colors.semantic.textSecondary} />
              <Text className="text-body-sm text-foreground-secondary">Duração</Text>
            </View>
            <Text className="flex-1 text-right text-body-sm font-semibold text-foreground">
              {formatMinutesRemaining(request.durationMinutes)}
            </Text>
          </View>

          <Text className="mt-3 text-caption text-foreground-tertiary">
            O prazo começa a contar no momento em que você autorizar, e o acesso
            se encerra sozinho ao final dele.
          </Text>
        </Surface>

        {/* Motivo declarado. */}
        {request.reason ? (
          <Surface className="mb-3" tone="subtle">
            <View className="flex-row items-start gap-2">
              <MessageSquareQuote size={15} color={colors.semantic.textSecondary} />
              <View className="flex-1">
                <Text className="text-overline font-semibold uppercase text-foreground-tertiary">
                  Motivo informado
                </Text>
                <Text className="mt-1 text-body text-foreground">{request.reason}</Text>
              </View>
            </View>
          </Surface>
        ) : null}

        {/* O que fica visível e o que não fica. */}
        <Surface className="mb-3">
          <Text className="text-overline font-semibold uppercase text-success">
            O profissional poderá ver
          </Text>
          <View className="mt-2.5 gap-2">
            {SCOPE_SHARES[scope].map((item) => (
              <View key={item} className="flex-row items-start gap-2">
                <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-success-subtle">
                  <Check size={10} color={colors.status.success.fg} />
                </View>
                <Text className="flex-1 text-body-sm text-foreground">{item}</Text>
              </View>
            ))}
          </View>

          {SCOPE_WITHHOLDS[scope].length > 0 && (
            <View className="mt-4 border-t border-border-subtle pt-3">
              <Text className="text-overline font-semibold uppercase text-foreground-tertiary">
                Continua privado
              </Text>
              <View className="mt-2.5 gap-2">
                {SCOPE_WITHHOLDS[scope].map((item) => (
                  <View key={item} className="flex-row items-start gap-2">
                    <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-surface-subtle">
                      <EyeOff size={10} color={colors.semantic.textTertiary} />
                    </View>
                    <Text className="flex-1 text-body-sm text-foreground-tertiary">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Surface>

        <View className="mb-2 flex-row items-start gap-2 px-1">
          <ShieldCheck size={14} color={colors.semantic.textTertiary} />
          <Text className="flex-1 text-caption text-foreground-tertiary">
            Toda abertura do prontuário fica registrada no seu histórico, e você
            pode revogar o acesso a qualquer momento.
          </Text>
        </View>
      </ScrollView>

      {/* As ações ficam fixas no rodapé: a decisão precisa estar ao alcance sem
          rolar de volta, e aprovar não pode ter o mesmo peso de negar. */}
      <View className="border-t border-border bg-surface px-5 pb-5 pt-4">
        {isResolved ? (
          <View className="items-center gap-2">
            <StatusBadge
              tone={request.status === "APPROVED" ? "active" : "denied"}
              label={
                request.status === "APPROVED" ? "Acesso autorizado" : "Acesso negado"
              }
            />
            <Text className="text-caption text-foreground-tertiary">
              Este pedido já foi respondido.
            </Text>
            <Button
              className="mt-2"
              label="Voltar"
              variant="outline"
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <View className="gap-2.5">
            <Button
              label="Autorizar acesso"
              variant="primary"
              size="lg"
              icon={<ShieldCheck size={18} color="#FFFFFF" />}
              loading={submitting === "approve"}
              disabled={submitting !== null}
              onPress={handleApprove}
              accessibilityHint="Pede confirmação antes de liberar o acesso"
            />
            <Button
              label="Negar acesso"
              variant="destructive"
              loading={submitting === "deny"}
              disabled={submitting !== null}
              onPress={handleDeny}
              icon={<X size={16} color={colors.status.danger.fg} />}
              accessibilityHint="Pede confirmação antes de recusar"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
