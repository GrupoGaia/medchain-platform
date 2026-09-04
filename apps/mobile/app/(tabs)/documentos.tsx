import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, ExamResultsTable, Text } from "../../src/components";
import emptyDocuments from "../../assets/img/empty-documents.png";
import * as DocumentPicker from "expo-document-picker";
import { FileText, Upload, Download } from "lucide-react-native";
import { api, type MedicalDocumentResponse } from "../../src/services/api";
import { colors } from "@medchain/ui-tokens";

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Imagem",
};

const DOC_TYPE_OPTIONS = Object.entries(DOC_TYPE_LABEL);

export default function DocumentosScreen() {
  const [documents, setDocuments] = useState<MedicalDocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("EXAM");

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.getMyDocuments();
      setDocuments(docs);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os documentos.");
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
      Alert.alert("Sucesso", "Documento enviado com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o documento.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(docId: string) {
    try {
      const { signedUrl } = await api.getDocumentUrl(docId);
      await Linking.openURL(signedUrl);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o documento.");
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </SafeAreaView>
    );
  }

  return (
    // Esta era a unica aba sem SafeAreaView, entao o titulo ficava embaixo do
    // relogio da barra de status enquanto as outras respeitavam o inset.
    <SafeAreaView className="flex-1 bg-gray-50">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
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
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">Meus Documentos</Text>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          className="flex-row items-center gap-2 rounded-xl bg-brand-600 px-4 py-2"
        >
          {uploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Upload size={14} color="white" />
          )}
          <Text className="text-sm font-medium text-white">
            {uploading ? "Enviando..." : "Adicionar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <Text className="text-sm font-semibold text-gray-900">
          Tipo do próximo documento
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {DOC_TYPE_OPTIONS.map(([value, label]) => {
            const active = selectedType === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => setSelectedType(value)}
                className={`rounded-full border px-3 py-2 ${
                  active
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    active ? "text-brand-700" : "text-gray-600"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {documents.length === 0 ? (
        <Card className="mt-6 py-8">
          <EmptyState
            image={emptyDocuments}
            title="Nenhum documento"
            description="Toque em Adicionar para enviar exames ou laudos."
          />
        </Card>
      ) : (
        <View className="gap-2">
          {documents.map((doc) => (
            <View key={doc.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <FileText size={18} color={colors.brand[700]} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {DOC_TYPE_LABEL[doc.type] ?? doc.type} ·{" "}
                    {new Date(doc.issuedAt).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDownload(doc.id)}
                  className="ml-2 rounded-lg border border-gray-200 p-2"
                >
                  <Download size={14} color={colors.neutral.subtle} />
                </TouchableOpacity>
              </View>
              {doc.results && doc.results.length > 0 && (
                <ExamResultsTable results={doc.results} />
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}
