import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Heart, FlaskConical, FileText, Pill, Activity } from "lucide-react-native";
import { useAppStore } from "../../src/context/AppStore";
import { MOCK_HISTORY, HistoryEvent } from "../../src/services/mocks/data";

const iconeMap: Record<string, React.ReactNode> = {
  Consulta: <Heart color="#0F766E" size={18} />,
  Exame: <FlaskConical color="#0F766E" size={18} />,
  Receita: <Pill color="#0F766E" size={18} />,
  Cirurgia: <FileText color="#0F766E" size={18} />,
};

function groupByPeriod(events: HistoryEvent[]): Record<string, HistoryEvent[]> {
  return events.reduce<Record<string, HistoryEvent[]>>((acc, ev) => {
    if (!acc[ev.period]) acc[ev.period] = [];
    acc[ev.period].push(ev);
    return acc;
  }, {});
}

export default function HistoricoScreen() {
  const { state } = useAppStore();
  const grouped = groupByPeriod(MOCK_HISTORY);
  const recentLogs = state.logs.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-6 text-2xl font-bold text-gray-900">Meu Histórico</Text>

        {Object.keys(grouped).map((period) => (
          <View key={period} className="mb-6">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {period}
            </Text>
            {grouped[period].map((item) => (
              <View key={item.id} className="mb-2 rounded-xl bg-white p-4">
                <View className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                    {iconeMap[item.type]}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium uppercase text-teal-600">{item.type}</Text>
                    <Text className="text-sm font-semibold text-gray-900">{item.description}</Text>
                    <Text className="text-xs text-gray-500">{item.detail}</Text>
                    {item.action && (
                      <TouchableOpacity
                        className="mt-2 self-start rounded-lg bg-teal-50 px-3 py-1.5"
                        accessibilityLabel={item.action}
                        accessibilityRole="button"
                      >
                        <Text className="text-xs font-medium text-teal-700">{item.action}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        {recentLogs.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Acessos ao prontuário
            </Text>
            {recentLogs.map((log) => (
              <View key={log.id} className="mb-2 flex-row items-start gap-3 rounded-xl bg-white p-4">
                <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <Activity color="#6366F1" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{log.description}</Text>
                  <Text className="text-xs text-gray-500">{log.professional}</Text>
                  <Text className="text-xs text-gray-400">{log.createdAt}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
