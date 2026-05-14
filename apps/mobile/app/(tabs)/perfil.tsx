import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { User, Phone, AlertTriangle, Pill, ChevronRight } from "lucide-react-native";

export default function PerfilScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Perfil</Text>

        {/* Avatar e nome */}
        <View className="mb-6 items-center rounded-2xl bg-white py-8">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-teal-600">
            <Text className="text-3xl font-bold text-white">JB</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">João Batista</Text>
          <Text className="text-sm text-gray-400">Tipo sanguíneo: A+</Text>
        </View>

        {/* Dados de saúde críticos */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Dados críticos
        </Text>
        <View className="mb-6 rounded-2xl bg-white">
          <View className="flex-row items-center gap-3 p-4">
            <AlertTriangle color="#F59E0B" size={18} />
            <View>
              <Text className="text-xs text-gray-400">Alergias</Text>
              <Text className="text-sm font-medium text-gray-900">
                Penicilina, AAS
              </Text>
            </View>
          </View>
          <View className="h-px bg-gray-100 mx-4" />
          <View className="flex-row items-center gap-3 p-4">
            <Pill color="#6366F1" size={18} />
            <View>
              <Text className="text-xs text-gray-400">Uso contínuo</Text>
              <Text className="text-sm font-medium text-gray-900">
                Losartana 50mg · Metformina 850mg
              </Text>
            </View>
          </View>
        </View>

        {/* Contatos de emergência */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Contatos de emergência
        </Text>
        <View className="mb-6 rounded-2xl bg-white">
          {[
            { nome: "Maria Batista", relacao: "Filha", telefone: "(11) 9 9999-0001" },
            { nome: "Pedro Batista", relacao: "Filho", telefone: "(11) 9 9999-0002" },
          ].map((contato, i, arr) => (
            <View key={i}>
              <TouchableOpacity className="flex-row items-center gap-3 p-4">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <User color="#6B7280" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {contato.nome}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {contato.relacao} · {contato.telefone}
                  </Text>
                </View>
                <ChevronRight color="#9CA3AF" size={16} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
            </View>
          ))}
        </View>

        <TouchableOpacity className="items-center rounded-xl border border-gray-200 bg-white py-4">
          <Text className="text-sm font-medium text-gray-600">
            Editar perfil
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
