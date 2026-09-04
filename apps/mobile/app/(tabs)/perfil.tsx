import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SectionLabel, Text } from "../../src/components";
import { User, AlertTriangle, Pill, Phone, LogOut, UserPlus } from "lucide-react-native";
import { api, type PatientProfileResponse } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthProvider";
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

// O telefone vem formatado do cadastro, com parenteses, espaco e traco. O
// discador so aceita digitos e o prefixo internacional.
async function callContact(phone: string) {
  try {
    await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
  } catch {
    Alert.alert("Erro", "Não foi possível abrir o discador.");
  }
}

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  const loadProfile = useCallback(() => {
    api
      .getMyProfile()
      .then((loaded) => {
        setProfile(loaded);
        setAwaitingApproval(false);
      })
      .catch(async () => {
        // Contato ainda nao aprovado nao gerencia paciente nenhum, entao toda
        // rota de paciente devolve 403. Os vinculos dele proprio continuam
        // legiveis, e sao o que diz se o pedido esta so aguardando resposta.
        try {
          const links = await api.getMyContactLinks();
          setAwaitingApproval(links.some((link) => link.status === "PENDING"));
        } catch {
          setAwaitingApproval(false);
        }
      });
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
      Alert.alert("Erro", "Não foi possível responder ao pedido.");
    } finally {
      setRespondingTo(null);
    }
  }

  if (awaitingApproval) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-8">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <UserPlus color={colors.alert.amber} size={26} />
        </View>
        <Text className="text-center text-lg font-bold text-gray-900">
          Aguardando o paciente
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Seu pedido para ser contato de emergência foi enviado. Até o paciente aceitar,
          você não tem acesso aos dados dele.
        </Text>
        <TouchableOpacity
          onPress={signOut}
          className="mt-8 flex-row items-center justify-center gap-2 rounded-xl bg-red-50 px-6 py-3"
          accessibilityLabel="Sair da conta"
          accessibilityRole="button"
        >
          <LogOut color={colors.alert.red} size={16} />
          <Text className="text-sm font-medium text-red-600">Sair</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Carregando...</Text>
      </SafeAreaView>
    );
  }

  // Pendentes primeiro, em bloco proprio: enquanto o paciente nao responde,
  // esse vinculo nao da acesso a nada, e misturar com os aprovados faria
  // parecer que ja da.
  const pendingLinks = profile.emergencyContacts.filter((c) => c.status === "PENDING");
  const contacts = profile.emergencyContacts.filter((c) => c.status === "APPROVED");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Perfil</Text>

        {/* Avatar */}
        <View className="mb-6 items-center rounded-2xl bg-white py-8">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-brand-600">
            <Text className="text-3xl font-bold text-white">{getInitials(profile.fullName)}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{profile.fullName}</Text>
          <Text className="text-sm text-gray-400">
            Tipo sanguíneo: {profile.bloodType ?? "Não informado"}
          </Text>
        </View>

        {/* Dados críticos */}
        <SectionLabel>
          Dados críticos
        </SectionLabel>
        <View className="mb-6 rounded-2xl bg-white">
          <View className="flex-row items-start gap-3 p-4">
            <AlertTriangle color={colors.alert.amber} size={18} />
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-400">Alergias</Text>
              <Text className="text-sm font-medium text-gray-900">
                {profile.allergies.length > 0
                  ? profile.allergies.join(", ")
                  : "Nenhuma registrada"}
              </Text>
            </View>
          </View>
          <View className="mx-4 h-px bg-gray-100" />
          <View className="flex-row items-start gap-3 p-4">
            <Pill color={colors.alert.info} size={18} />
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-400">Condições crônicas</Text>
              <Text className="text-sm font-medium text-gray-900">
                {profile.chronicConditions.length > 0
                  ? profile.chronicConditions.join(" · ")
                  : "Nenhuma registrada"}
              </Text>
            </View>
          </View>
          <View className="mx-4 h-px bg-gray-100" />
          <View className="flex-row items-start gap-3 p-4">
            <Pill color={colors.brand[700]} size={18} />
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-400">Uso contínuo</Text>
              <Text className="text-sm font-medium text-gray-900">
                {profile.continuousMeds.length > 0
                  ? profile.continuousMeds.join(" · ")
                  : "Nenhum registrado"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pedidos de vínculo aguardando resposta */}
        {pendingLinks.length > 0 && (
          <>
            <SectionLabel tone="warning">Pedidos de vínculo</SectionLabel>
            <View className="mb-6 gap-3">
              {pendingLinks.map((link) => (
                <View
                  key={link.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
                >
                  <View className="mb-3 flex-row items-center gap-2">
                    <UserPlus color={colors.alert.amber} size={18} />
                    <Text className="text-sm font-semibold text-amber-700">
                      Quer ser seu contato de emergência
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-gray-900">{link.name}</Text>
                  <Text className="text-sm text-gray-500">
                    {link.relation} · {link.phone}
                  </Text>
                  <Text className="mb-4 mt-2 text-xs text-gray-500">
                    Se você aceitar, essa pessoa poderá autorizar acessos ao seu prontuário
                    e ver seus documentos. Enquanto não responder, ela não vê nada.
                  </Text>

                  {respondingTo === link.id ? (
                    <ActivityIndicator color={colors.brand[700]} />
                  ) : (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => respondToLink(link.id, false)}
                        className="flex-1 rounded-xl border border-gray-200 bg-white py-3"
                        accessibilityRole="button"
                        accessibilityLabel={`Recusar ${link.name} como contato de emergência`}
                      >
                        <Text className="text-center text-sm font-semibold text-gray-600">
                          Recusar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => respondToLink(link.id, true)}
                        className="flex-1 rounded-xl bg-brand-600 py-3"
                        accessibilityRole="button"
                        accessibilityLabel={`Aceitar ${link.name} como contato de emergência`}
                      >
                        <Text className="text-center text-sm font-semibold text-white">
                          Aceitar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Contatos de emergência */}
        <SectionLabel>
          Contatos de emergência
        </SectionLabel>
        <View className="mb-6 rounded-2xl bg-white">
          {contacts.length === 0 && (
            <View className="p-4">
              <Text className="text-sm text-gray-400">Nenhum contato cadastrado</Text>
            </View>
          )}
          {contacts.map((contato, i) => (
            <View key={contato.id}>
              <TouchableOpacity
                onPress={() => callContact(contato.phone)}
                className="flex-row items-center gap-3 p-4 active:bg-gray-50"
                accessibilityLabel={`Ligar para ${contato.name}, ${contato.relation}`}
                accessibilityRole="button"
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <User color={colors.neutral.subtle} size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">{contato.name}</Text>
                  <Text className="text-xs text-gray-400">
                    {contato.relation} · {contato.phone}
                  </Text>
                </View>
                <Phone color={colors.brand[700]} size={16} />
              </TouchableOpacity>
              {i < contacts.length - 1 && <View className="mx-4 h-px bg-gray-100" />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/editar-perfil" as never)}
          className="mb-3 items-center rounded-xl border border-gray-200 bg-white py-4"
          accessibilityLabel="Editar perfil"
          accessibilityRole="button"
        >
          <Text className="text-sm font-medium text-gray-600">Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signOut}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-red-50 py-4"
          accessibilityLabel="Sair da conta"
          accessibilityRole="button"
        >
          <LogOut color={colors.alert.red} size={16} />
          <Text className="text-sm font-medium text-red-600">Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
