import { useState, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { User, AlertTriangle, Pill, ChevronRight, LogOut } from "lucide-react-native";
import { api, type PatientProfileResponse } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthProvider";

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PerfilScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);

  useEffect(() => {
    api.getMyProfile().then(setProfile).catch(() => null);
  }, []);

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Carregando...</Text>
      </SafeAreaView>
    );
  }

  const contacts = profile.emergencyContacts;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Perfil</Text>

        {/* Avatar */}
        <View className="mb-6 items-center rounded-2xl bg-white py-8">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-teal-600">
            <Text className="text-3xl font-bold text-white">{getInitials(profile.fullName)}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{profile.fullName}</Text>
          <Text className="text-sm text-gray-400">
            Tipo sanguíneo: {profile.bloodType ?? "Não informado"}
          </Text>
        </View>

        {/* Dados críticos */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Dados críticos
        </Text>
        <View className="mb-6 rounded-2xl bg-white">
          <View className="flex-row items-start gap-3 p-4">
            <AlertTriangle color="#F59E0B" size={18} />
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
            <Pill color="#6366F1" size={18} />
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
            <Pill color="#0F766E" size={18} />
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

        {/* Contatos de emergência */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Contatos de emergência
        </Text>
        <View className="mb-6 rounded-2xl bg-white">
          {contacts.length === 0 && (
            <View className="p-4">
              <Text className="text-sm text-gray-400">Nenhum contato cadastrado</Text>
            </View>
          )}
          {contacts.map((contato, i) => (
            <View key={contato.id}>
              <TouchableOpacity
                className="flex-row items-center gap-3 p-4"
                accessibilityLabel={`${contato.name}, ${contato.relation}`}
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <User color="#6B7280" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">{contato.name}</Text>
                  <Text className="text-xs text-gray-400">
                    {contato.relation} · {contato.phone}
                  </Text>
                </View>
                <ChevronRight color="#9CA3AF" size={16} />
              </TouchableOpacity>
              {i < contacts.length - 1 && <View className="mx-4 h-px bg-gray-100" />}
            </View>
          ))}
        </View>

        <TouchableOpacity
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
          <LogOut color="#DC2626" size={16} />
          <Text className="text-sm font-medium text-red-600">Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
