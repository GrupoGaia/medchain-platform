import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { ShieldCheck, ShieldOff } from "lucide-react-native";

const acessosAtivos = [
  {
    medico: "Dr. Carlos Silva",
    crm: "CRM-SP 123456",
    hospital: "Hospital São Lucas",
    expira: "03h 45m",
    escopo: "Prontuário completo",
  },
];

export default function PermissoesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-2 text-2xl font-bold text-gray-900">Permissões</Text>
        <Text className="mb-6 text-sm text-gray-500">
          Controle quem tem acesso aos seus dados
        </Text>

        {acessosAtivos.length > 0 ? (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Acessos ativos
            </Text>
            {acessosAtivos.map((acesso, i) => (
              <View key={i} className="mb-3 rounded-2xl bg-white p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <ShieldCheck color="#0F766E" size={20} />
                  <Text className="text-sm font-semibold text-teal-700">
                    Ativo · {acesso.expira} restantes
                  </Text>
                </View>
                <Text className="text-base font-bold text-gray-900">
                  {acesso.medico}
                </Text>
                <Text className="text-sm text-gray-500">{acesso.crm}</Text>
                <Text className="text-sm text-gray-500">{acesso.hospital}</Text>
                <View className="mt-2 self-start rounded-full bg-teal-50 px-3 py-1">
                  <Text className="text-xs text-teal-700">{acesso.escopo}</Text>
                </View>
                <TouchableOpacity className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-red-50 py-3">
                  <ShieldOff color="#DC2626" size={16} />
                  <Text className="text-sm font-semibold text-red-600">
                    Revogar acesso
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View className="items-center rounded-2xl bg-white py-12">
            <ShieldCheck color="#9CA3AF" size={40} />
            <Text className="mt-3 text-base font-medium text-gray-500">
              Nenhum acesso ativo
            </Text>
            <Text className="text-sm text-gray-400">
              Seus dados estão protegidos
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
