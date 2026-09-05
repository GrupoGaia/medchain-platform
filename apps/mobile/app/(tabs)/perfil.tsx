import { useCallback, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  User,
  AlertTriangle,
  Activity,
  Pill,
  Phone,
  LogOut,
  UserPlus,
  Copy,
  Droplet,
} from "lucide-react-native";
import { formatCpf } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import {
  Button,
  InfoRow,
  ListRow,
  RowDivider,
  Screen,
  ScreenHeader,
  SectionHeader,
  Surface,
  Text,
} from "../../src/components";
import { api, type PatientProfileResponse } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthProvider";

function getInitials(fullName: string): string {
  const parts = fullName.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

// O telefone vem formatado do cadastro, com parenteses, espaco e traco. O
// discador so aceita digitos e o prefixo internacional.
async function callContact(phone: string) {
  try {
    await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
  } catch {
    Alert.alert("Não foi possível ligar", "Abra o discador manualmente.");
  }
}

function listOrFallback(values: string[], fallback: string): string {
  return values.length > 0 ? values.join(", ") : fallback;
}

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // A espera do contato de emergência é tratada no layout das abas, que troca
  // as cinco telas por um aviso único. Aqui basta não quebrar quando o perfil
  // não carrega.
  const loadProfile = useCallback(() => {
    api
      .getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  // useFocusEffect e nao useEffect: ao voltar da tela de edicao a aba nao
  // remonta, e sem isto o perfil continuaria mostrando o valor antigo.
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  async function respondToLink(linkId: string, approve: boolean) {
    setRespondingTo(linkId);
    try {
      await (approve ? api.approveContactLink(linkId) : api.denyContactLink(linkId));
      loadProfile();
    } catch {
      Alert.alert("Não foi possível responder", "Tente novamente.");
    } finally {
      setRespondingTo(null);
    }
  }

  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Você precisará entrar de novo para acessar o app.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  }

  if (!profile) {
    return (
      <Screen center scroll={false}>
        <Text className="text-body-sm text-foreground-tertiary">
          Carregando seu perfil…
        </Text>
      </Screen>
    );
  }

  // Pendentes primeiro, em bloco proprio: enquanto o paciente nao responde,
  // esse vinculo nao da acesso a nada, e misturar com os aprovados faria
  // parecer que ja da.
  const pendingLinks = profile.emergencyContacts.filter((c) => c.status === "PENDING");
  const contacts = profile.emergencyContacts.filter((c) => c.status === "APPROVED");

  return (
    <Screen>
      <ScreenHeader title="Perfil" subtitle="Seus dados e quem pode agir por você." />

      {/* Identidade. */}
      <Surface className="mb-6 items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full border border-interactive-border bg-interactive-subtle">
          <Text className="text-page-title font-bold text-interactive">
            {getInitials(profile.fullName)}
          </Text>
        </View>
        <Text className="mt-3 text-section-title font-semibold text-foreground">
          {profile.fullName}
        </Text>

        {/* O medico localiza o paciente pelo CPF, entao o paciente precisa
            conseguir ler o dele para ditar em atendimento. */}
        {profile.cpf ? (
          <View
            accessible
            accessibilityLabel={`Seu CPF é ${formatCpf(profile.cpf)}`}
            className="mt-4 w-full items-center rounded-lg border border-border bg-surface-subtle px-4 py-3"
          >
            <View className="flex-row items-center gap-1.5">
              <Copy size={12} color={colors.semantic.textTertiary} />
              <Text className="text-overline font-semibold uppercase text-foreground-tertiary">
                Seu CPF
              </Text>
            </View>
            <Text selectable className="mt-1 text-section-title font-bold text-foreground">
              {formatCpf(profile.cpf)}
            </Text>
            <Text className="mt-1 text-center text-caption text-foreground-tertiary">
              Informe ao profissional para ele solicitar acesso
            </Text>
          </View>
        ) : null}
      </Surface>

      {/* Dados clínicos. */}
      <View className="mb-6 gap-3">
        <SectionHeader
          title="Dados clínicos"
          description="É o que o profissional vê em qualquer escopo, inclusive em emergência."
        />
        <Surface>
          <InfoRow
            icon={<Droplet size={14} color={colors.semantic.textTertiary} />}
            label="Tipo sanguíneo"
            value={profile.bloodType ?? "Não informado"}
          />
          <View className="h-px bg-border-subtle" />
          <InfoRow
            icon={<AlertTriangle size={14} color={colors.status.warning.fg} />}
            label="Alergias"
            value={listOrFallback(profile.allergies, "Nenhuma registrada")}
            emphasis={profile.allergies.length > 0}
          />
          <View className="h-px bg-border-subtle" />
          <InfoRow
            icon={<Activity size={14} color={colors.semantic.textTertiary} />}
            label="Condições crônicas"
            value={listOrFallback(profile.chronicConditions, "Nenhuma registrada")}
          />
          <View className="h-px bg-border-subtle" />
          <InfoRow
            icon={<Pill size={14} color={colors.semantic.textTertiary} />}
            label="Medicamentos contínuos"
            value={listOrFallback(profile.continuousMeds, "Nenhum registrado")}
          />
        </Surface>
        <Button
          label="Editar dados clínicos"
          variant="outline"
          onPress={() => router.push("/editar-perfil" as never)}
        />
      </View>

      {/* Pedidos de vínculo aguardando resposta. */}
      {pendingLinks.length > 0 && (
        <View className="mb-6 gap-3">
          <SectionHeader
            title="Pedidos de vínculo"
            count={pendingLinks.length}
            description="Alguém quer ser seu contato de emergência."
          />
          {pendingLinks.map((link) => (
            <Surface key={link.id} tone="warning">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg border border-warning-border bg-warning-subtle">
                  <UserPlus size={18} color={colors.status.warning.fg} />
                </View>
                <View className="flex-1">
                  <Text className="text-card-title font-semibold text-foreground">
                    {link.name}
                  </Text>
                  <Text className="text-body-sm text-foreground-secondary">
                    {link.relation} · {link.phone}
                  </Text>
                </View>
              </View>

              <Text className="mt-3 text-body-sm text-foreground-secondary">
                Se você aceitar, essa pessoa poderá autorizar acessos ao seu
                prontuário e ver seus documentos. Enquanto não responder, ela não
                vê nada.
              </Text>

              <View className="mt-4 flex-row gap-2">
                <Button
                  label="Recusar"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  className="flex-1"
                  loading={respondingTo === link.id}
                  disabled={respondingTo !== null}
                  onPress={() => respondToLink(link.id, false)}
                  accessibilityLabel={`Recusar ${link.name} como contato de emergência`}
                />
                <Button
                  label="Aceitar"
                  size="sm"
                  fullWidth={false}
                  className="flex-1"
                  loading={respondingTo === link.id}
                  disabled={respondingTo !== null}
                  onPress={() => respondToLink(link.id, true)}
                  accessibilityLabel={`Aceitar ${link.name} como contato de emergência`}
                />
              </View>
            </Surface>
          ))}
        </View>
      )}

      {/* Contatos aprovados. */}
      <View className="mb-6 gap-3">
        <SectionHeader
          title="Contatos de emergência"
          count={contacts.length}
          description="Podem autorizar acessos por você quando não for possível responder."
        />
        <Surface padded={false} className="overflow-hidden">
          {contacts.length === 0 ? (
            <View className="px-4 py-5">
              <Text className="text-body-sm text-foreground-tertiary">
                Nenhum contato aprovado.
              </Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <View key={contact.id}>
                {index > 0 && <RowDivider />}
                <ListRow
                  title={contact.name}
                  subtitle={`${contact.relation} · ${contact.phone}`}
                  onPress={() => callContact(contact.phone)}
                  accessibilityLabel={`Ligar para ${contact.name}, ${contact.relation}`}
                  leading={
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-subtle">
                      <User size={16} color={colors.semantic.textSecondary} />
                    </View>
                  }
                  trailing={
                    <Phone size={16} color={colors.semantic.interactive} />
                  }
                />
              </View>
            ))
          )}
        </Surface>
      </View>

      <Button
        label="Sair da conta"
        variant="destructive"
        icon={<LogOut size={16} color={colors.status.danger.fg} />}
        onPress={confirmSignOut}
      />
    </Screen>
  );
}
