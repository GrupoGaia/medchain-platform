import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Shield, FileText } from "lucide-react-native";

export default function InicioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-teal-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Olá, João</Text>
            <Text className="text-sm text-gray-500">Seus dados estão seguros</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-600">
            <Text className="text-lg font-bold text-white">JB</Text>
          </View>
        </View>

        {/* CTA principal */}
        <TouchableOpacity
          className="mb-4 w-full items-center rounded-2xl bg-teal-600 px-6 py-5"
          activeOpacity={0.8}
        >
          <Shield color="#fff" size={28} />
          <Text className="mt-2 text-lg font-semibold text-white">
            Gerar Token de Acesso
          </Text>
          <Text className="text-sm text-teal-100">
            Autorize um profissional de saúde
          </Text>
        </TouchableOpacity>

        {/* Acesso ativo */}
        <View className="mb-4 rounded-2xl border border-teal-200 bg-white p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-teal-700">
              Acesso ativo
            </Text>
            <View className="rounded-full bg-teal-100 px-2 py-1">
              <Text className="text-xs font-medium text-teal-700">
                03h 45m restantes
              </Text>
            </View>
          </View>
          <Text className="text-base font-semibold text-gray-900">
            Dr. Carlos Silva
          </Text>
          <Text className="text-sm text-gray-500">Hospital São Lucas</Text>
          <View className="mt-3 flex-row gap-2">
            <TouchableOpacity className="flex-1 rounded-lg border border-gray-200 py-2">
              <Text className="text-center text-sm text-gray-600">Detalhes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-lg bg-red-50 py-2">
              <Text className="text-center text-sm font-medium text-red-600">
                Revogar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exames recentes */}
        <Text className="mb-3 text-base font-semibold text-gray-900">
          Exames recentes
        </Text>
        {[
          { nome: "Hemograma completo", data: "12 mai 2026" },
          { nome: "Raio-X de tórax", data: "05 mai 2026" },
          { nome: "Perfil lipídico", data: "28 abr 2026" },
        ].map((exame, i) => (
          <TouchableOpacity
            key={i}
            className="mb-2 flex-row items-center rounded-xl bg-white p-4"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <FileText color="#0F766E" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{exame.nome}</Text>
              <Text className="text-xs text-gray-400">{exame.data}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
