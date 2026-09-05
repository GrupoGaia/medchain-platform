import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  FileText,
  FlaskConical,
  Pill,
  Scan,
  Upload,
  Download,
  ChevronDown,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import {
  Button,
  EmptyState,
  ExamResultsTable,
  Screen,
  ScreenHeader,
  SectionHeader,
  Surface,
  Text,
} from "../../src/components";
import { api, type MedicalDocumentResponse } from "../../src/services/api";

// Mesmo vocabulário e mesmos ícones do portal: um laudo precisa parecer um
// laudo nas duas pontas.
const DOC_TYPE: Record<string, { label: string; icon: LucideIcon }> = {
  EXAM: { label: "Exame", icon: FlaskConical },
  REPORT: { label: "Laudo", icon: FileText },
  PRESCRIPTION: { label: "Receita", icon: Pill },
  IMAGING: { label: "Imagem", icon: Scan },
};

const DOC_TYPE_OPTIONS = Object.entries(DOC_TYPE);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DocumentosScreen() {
  const [documents, setDocuments] = useState<MedicalDocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("EXAM");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.getMyDocuments();
      setDocuments(docs);
    } catch {
      Alert.alert("Não foi possível carregar", "Puxe a tela para baixo para tentar de novo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleUpload() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await api.uploadDocument({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "application/pdf",
        name: asset.name ?? "documento",
        title: asset.name?.replace(/\.[^.]+$/, "") ?? "Documento",
        type: selectedType,
        issuedAt: new Date().toISOString().split("T")[0]!,
      });
      await loadDocuments();
      Alert.alert("Documento enviado", "Ele já aparece na sua lista.");
    } catch {
      Alert.alert("Não foi possível enviar", "Tente novamente em alguns instantes.");
    } finally {
      setUploading(false);
    }
  }

  async function handleOpen(docId: string) {
    try {
      const { signedUrl } = await api.getDocumentUrl(docId);
      await Linking.openURL(signedUrl);
    } catch {
      Alert.alert("Não foi possível abrir", "Tente novamente em alguns instantes.");
    }
  }

  if (loading) {
    return (
      <Screen center scroll={false}>
        <Text className="text-body-sm text-foreground-tertiary">
          Carregando seus documentos…
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDocuments();
          }}
        />
      }
    >
      <ScreenHeader
        title="Meus documentos"
        subtitle="Exames, laudos e receitas que ficam disponíveis para quem você autorizar."
      />

      {/* Envio. O tipo vem antes do botão porque é ele que decide para qual
          escopo o documento vai ficar visível. */}
      <Surface className="mb-6">
        <Text className="text-label font-medium text-foreground">
          Tipo do documento a enviar
        </Text>
        <View
          accessibilityRole="radiogroup"
          className="mt-3 flex-row flex-wrap gap-2"
        >
          {DOC_TYPE_OPTIONS.map(([value, config]) => {
            const active = selectedType === value;
            const Icon = config.icon;
            return (
              <Pressable
                key={value}
                onPress={() => setSelectedType(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active, checked: active }}
                accessibilityLabel={config.label}
                className={`min-h-touch flex-row items-center gap-1.5 rounded-lg border px-3 ${
                  active
                    ? "border-interactive bg-interactive-subtle"
                    : "border-border bg-surface active:bg-surface-subtle"
                }`}
              >
                <Icon
                  size={14}
                  color={
                    active
                      ? colors.semantic.interactive
                      : colors.semantic.textTertiary
                  }
                />
                <Text
                  className={`text-label ${
                    active
                      ? "font-semibold text-interactive"
                      : "font-medium text-foreground-secondary"
                  }`}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          className="mt-4"
          label={uploading ? "Enviando…" : "Escolher arquivo e enviar"}
          icon={<Upload size={16} color="#FFFFFF" />}
          loading={uploading}
          disabled={uploading}
          onPress={handleUpload}
          accessibilityHint="Abre o seletor de arquivos do aparelho"
        />
      </Surface>

      <View className="gap-3">
        <SectionHeader title="Seus documentos" count={documents.length} />

        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} color={colors.semantic.textTertiary} />}
            title="Nenhum documento enviado"
            description="Envie um exame ou laudo para que ele fique disponível quando você autorizar um profissional."
          />
        ) : (
          documents.map((doc) => {
            const config = DOC_TYPE[doc.type];
            const Icon = config?.icon ?? FileText;
            const hasResults = doc.results && doc.results.length > 0;
            const isOpen = expanded === doc.id;

            return (
              <Surface key={doc.id}>
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-subtle">
                    <Icon size={16} color={colors.semantic.textSecondary} />
                  </View>
                  <View className="flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-body font-semibold text-foreground"
                    >
                      {doc.title}
                    </Text>
                    <Text className="text-caption text-foreground-tertiary">
                      {config?.label ?? doc.type} · {formatDate(doc.issuedAt)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleOpen(doc.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${doc.title}`}
                    hitSlop={8}
                    className="h-11 w-11 items-center justify-center rounded-lg border border-border active:bg-surface-subtle"
                  >
                    <Download size={16} color={colors.semantic.textSecondary} />
                  </Pressable>
                </View>

                {hasResults && (
                  <>
                    <Pressable
                      onPress={() => setExpanded(isOpen ? null : doc.id)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      accessibilityLabel={`${
                        isOpen ? "Ocultar" : "Ver"
                      } resultados laboratoriais de ${doc.title}`}
                      className="mt-3 min-h-touch flex-row items-center gap-1.5"
                    >
                      <ChevronDown
                        size={15}
                        color={colors.semantic.interactive}
                        style={{
                          transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                        }}
                      />
                      <Text className="text-label font-semibold text-interactive">
                        Resultados laboratoriais ({doc.results!.length})
                      </Text>
                    </Pressable>
                    {isOpen && <ExamResultsTable results={doc.results!} />}
                  </>
                )}
              </Surface>
            );
          })
        )}
      </View>
    </Screen>
  );
}
