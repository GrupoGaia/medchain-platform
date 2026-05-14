import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Heart, FlaskConical, FileText, Pill } from "lucide-react-native";

const eventos = [
  {
    periodo: "Hoje",
    itens: [
      { tipo: "Consulta", descricao: "Cardiologista — Dr. Carlos Silva", sub: "Retorno semestral", icone: "heart" },
    ],
  },
  {
    periodo: "Mês passado",
    itens: [
      { tipo: "Exame", descricao: "Hemograma completo", sub: "Resultado: normal", icone: "flask" },
      { tipo: "Receita", descricao: "Renovação de receita", sub: "Losartana 50mg · Metformina 850mg", icone: "pill", acao: "Baixar PDF" },
    ],
  },
  {
    periodo: "Ano passado",
    itens: [
      { tipo: "Cirurgia", descricao: "Apendicectomia", sub: "Hospital São Lucas · Laparoscopia", icone: "file" },
    ],
  },
];

const iconeMap: Record<string, React.ReactNode> = {
  heart: <Heart color="#0F766E" size={18} />,
  flask: <FlaskConical color="#0F766E" size={18} />,
  pill: <Pill color="#0F766E" size={18} />,
  file: <FileText color="#0F766E" size={18} />,
};

export default function HistoricoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">
          Meu Histórico Clínico
        </Text>
        {eventos.map((grupo) => (
          <View key={grupo.periodo} className="mb-6">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {grupo.periodo}
            </Text>
            {grupo.itens.map((item, i) => (
              <View
                key={i}
                className="mb-2 rounded-xl bg-white p-4"
              >
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                    {iconeMap[item.icone]}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium uppercase text-teal-600">
                      {item.tipo}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.descricao}
                    </Text>
                    <Text className="text-xs text-gray-500">{item.sub}</Text>
                    {item.acao && (
                      <TouchableOpacity className="mt-2 self-start rounded-lg bg-teal-50 px-3 py-1.5">
                        <Text className="text-xs font-medium text-teal-700">
                          {item.acao}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
