import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { FileText, Upload, Download } from "lucide-react-native";
import { api, type MedicalDocumentResponse } from "../../src/services/api";

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Imagem",
};

export default function DocumentosScreen() {
  const [documents, setDocuments] = useState<MedicalDocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        type: "EXAM",
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
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
          className="flex-row items-center gap-2 rounded-xl bg-teal-600 px-4 py-2"
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

      {documents.length === 0 ? (
        <View className="mt-16 items-center">
          <FileText size={48} color="#D1D5DB" />
          <Text className="mt-3 text-base font-medium text-gray-400">
            Nenhum documento
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            Toque em Adicionar para enviar exames ou laudos.
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {documents.map((doc) => (
            <View
              key={doc.id}
              className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                <FileText size={18} color="#0F766E" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={1}
                >
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
                <Download size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
