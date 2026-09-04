import { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Plus, ArrowLeft } from "lucide-react-native";
import { SectionLabel, Text } from "../src/components";
import { api } from "../src/services/api";
import { BLOOD_TYPES, type BloodType } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";

interface ListEditorProps {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}

// O paciente adiciona item a item em vez de digitar tudo separado por virgula.
// Assim cada entrada vira uma etiqueta removivel, e o que o medico le no
// prontuario e exatamente o que foi digitado aqui.
function ListEditor({ label, placeholder, items, onChange }: ListEditorProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    // A comparacao sem caixa espelha a do servidor, que tambem remove
    // repetido. Sem isso o item some depois de salvar, sem explicacao.
    const exists = items.some(
      (item) => item.toLocaleLowerCase("pt-BR") === value.toLocaleLowerCase("pt-BR")
    );
    if (!exists) onChange([...items, value]);
    setDraft("");
  }

  return (
    <View className="mb-6">
      <SectionLabel>{label}</SectionLabel>
      <View className="rounded-2xl bg-white p-4">
        {items.length === 0 && (
          <Text className="mb-3 text-sm text-gray-400">Nada registrado</Text>
        )}

        {items.length > 0 && (
          <View className="mb-3 flex-row flex-wrap gap-2">
            {items.map((item) => (
              <View
                key={item}
                className="flex-row items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5"
              >
                <Text className="text-xs font-medium text-gray-700">{item}</Text>
                <TouchableOpacity
                  onPress={() => onChange(items.filter((i) => i !== item))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item}`}
                  hitSlop={8}
                >
                  <X size={13} color={colors.neutral.subtle} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addItem}
            returnKeyType="done"
            placeholder={placeholder}
            maxLength={120}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900"
          />
          <TouchableOpacity
            onPress={addItem}
            className="items-center justify-center rounded-lg bg-brand-600 px-4"
            accessibilityRole="button"
            accessibilityLabel={`Adicionar em ${label}`}
          >
            <Plus size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [continuousMeds, setContinuousMeds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const profile = await api.getMyProfile();
      setBloodType((profile.bloodType as BloodType | null) ?? null);
      setAllergies(profile.allergies);
      setChronicConditions(profile.chronicConditions);
      setContinuousMeds(profile.continuousMeds);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seu perfil.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      await api.updateMyProfile({ bloodType, allergies, chronicConditions, continuousMeds });
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color={colors.brand[700]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 flex-row items-center gap-1.5"
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={18} color={colors.brand[700]} />
            <Text className="text-sm font-semibold text-brand-700">Voltar</Text>
          </TouchableOpacity>

          <Text className="mb-1 text-2xl font-bold text-gray-900">Editar perfil</Text>
          <Text className="mb-6 text-sm text-gray-500">
            É o que o médico vê no cartão do prontuário, inclusive em emergência.
          </Text>

          <SectionLabel>Tipo sanguíneo</SectionLabel>
          <View className="mb-6 rounded-2xl bg-white p-4">
            <View className="flex-row flex-wrap gap-2">
              {BLOOD_TYPES.map((type) => {
                const active = bloodType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setBloodType(type)}
                    className={`rounded-full border px-4 py-2 ${
                      active ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={`Tipo sanguíneo ${type}`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-brand-700" : "text-gray-600"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Quem marcou errado precisa conseguir voltar para "não informado". */}
              <TouchableOpacity
                onPress={() => setBloodType(null)}
                className={`rounded-full border px-4 py-2 ${
                  bloodType === null ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"
                }`}
                accessibilityRole="button"
                accessibilityLabel="Tipo sanguíneo não informado"
              >
                <Text
                  className={`text-xs font-bold ${
                    bloodType === null ? "text-brand-700" : "text-gray-600"
                  }`}
                >
                  Não informado
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ListEditor
            label="Alergias"
            placeholder="Ex: Penicilina"
            items={allergies}
            onChange={setAllergies}
          />
          <ListEditor
            label="Condições crônicas"
            placeholder="Ex: Hipertensão arterial"
            items={chronicConditions}
            onChange={setChronicConditions}
          />
          <ListEditor
            label="Medicamentos contínuos"
            placeholder="Ex: Losartana 50mg"
            items={continuousMeds}
            onChange={setContinuousMeds}
          />

          <TouchableOpacity
            onPress={save}
            disabled={saving}
            className="items-center rounded-xl bg-brand-600 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Salvar alterações"
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-semibold text-white">Salvar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
