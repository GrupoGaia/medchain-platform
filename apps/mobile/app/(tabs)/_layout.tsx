import { Tabs } from "expo-router";
import { Home, Clock, ShieldCheck, User, FileText } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@medchain/ui-tokens";
import { useAppStore } from "../../src/context/AppStore";

export default function TabsLayout() {
  const { pendingRequests } = useAppStore();
  const insets = useSafeAreaInsets();
  const pendingCount = pendingRequests.length;

  // A altura da barra soma o inset de baixo. Fixar um valor sozinho fazia a
  // barra de gestos do Android passar por cima dos rotulos das abas.
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    // Permissões vem logo depois de Início porque decidir e revogar acesso é o
    // que o paciente vem fazer no app; documento e histórico são consulta.
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.semantic.interactive,
        tabBarInactiveTintColor: colors.semantic.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.semantic.surface,
          borderTopColor: colors.semantic.border,
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        tabBarBadgeStyle: {
          backgroundColor: colors.status.warning.solid,
          color: colors.semantic.textInverse,
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="permissoes"
        options={{
          title: "Permissões",
          tabBarIcon: ({ color, size }) => (
            <ShieldCheck color={color} size={size} />
          ),
          // O contador na aba é o que avisa o paciente de um pedido pendente
          // enquanto ele está em outra tela.
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarAccessibilityLabel:
            pendingCount > 0
              ? `Permissões, ${pendingCount} ${
                  pendingCount === 1 ? "pedido aguardando" : "pedidos aguardando"
                } sua resposta`
              : "Permissões",
        }}
      />
      <Tabs.Screen
        name="documentos"
        options={{
          title: "Documentos",
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
