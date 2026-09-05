import { ScrollView, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  /** Desliga a rolagem em telas que já têm lista própria ou conteúdo centrado. */
  scroll?: boolean;
  /** Remove o respiro lateral padrão, para conteúdo que sangra até a borda. */
  padded?: boolean;
  refreshControl?: ScrollViewProps["refreshControl"];
  /** Centraliza verticalmente. Usado em carregamento e em tela de aviso. */
  center?: boolean;
};

/**
 * Moldura de tela. Concentra a área segura, o fundo e o respiro padrão para que
 * nenhuma aba precise redescobrir esses valores — era o que fazia uma tela
 * ficar embaixo da barra de status enquanto as outras respeitavam o inset.
 *
 * A borda inferior fica de fora do `edges`: quem cuida dela é a barra de abas.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  refreshControl,
  center = false,
}: Props) {
  const padding = padded ? "px-5" : "";

  if (!scroll) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View
          className={`flex-1 ${padding} ${center ? "items-center justify-center" : ""}`}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: padded ? 20 : 0,
          paddingTop: 8,
          // Folga no fim da rolagem para o último item não encostar na barra.
          paddingBottom: 32,
          flexGrow: center ? 1 : undefined,
          justifyContent: center ? "center" : undefined,
        }}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
