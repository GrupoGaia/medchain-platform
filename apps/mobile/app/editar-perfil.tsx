import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Plus } from "lucide-react-native";
import { BLOOD_TYPES, type BloodType } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import {
  Button,
  Screen,
  ScreenHeader,
  SectionHeader,
  Surface,
  Text,
} from "../src/components";
import { api } from "../src/services/api";

interface ListEditorProps {
  label: string;
  description: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}

// O paciente adiciona item a item em vez de digitar tudo separado por virgula.
// Assim cada entrada vira uma etiqueta removivel, e o que o medico le no
// prontuario e exatamente o que foi digitado aqui.
function ListEditor({
  label,
  description,
  placeholder,
  items,
  onChange,
}: ListEditorProps) {
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
    <View className="gap-3">
      <SectionHeader title={label} description={description} />
      <Surface>
        {items.length === 0 ? (
          <Text className="text-body-sm text-foreground-tertiary">
            Nada registrado ainda.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {items.map((item) => (
              <View
                key={item}
                className="flex-row items-center gap-1.5 rounded-md border border-border bg-surface-subtle py-1.5 pl-2.5 pr-1.5"
              >
                <Text className="text-label font-medium text-foreground">{item}</Text>
                <Pressable
                  onPress={() => onChange(items.filter((i) => i !== item))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item} de ${label}`}
                  hitSlop={12}
                  className="h-6 w-6 items-center justify-center rounded active:bg-border"
                >
                  <X size={13} color={colors.semantic.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View className="mt-4 flex-row gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addItem}
            returnKeyType="done"
            placeholder={placeholder}
            placeholderTextColor={colors.semantic.textDisabled}
            maxLength={120}
            accessibilityLabel={`Novo item em ${label}`}
            className="min-h-touch flex-1 rounded-lg border border-border-control bg-surface px-3 py-2.5 text-body text-foreground"
          />
          <Pressable
            onPress={addItem}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar item em ${label}`}
            className="h-touch w-touch items-center justify-center rounded-lg bg-interactive active:bg-interactive-hover"
          >
            <Plus size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Surface>
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
      Alert.alert("Não foi possível carregar", "Tente abrir a tela de novo.");
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
      Alert.alert("Não foi possível salvar", "Tente novamente em alguns instantes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen center scroll={false}>
        <Text className="text-body-sm text-foreground-tertiary">Carregando…</Text>
      </Screen>
    );
  }

  const bloodOptions: (BloodType | null)[] = [...BLOOD_TYPES, null];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <Screen>
        <ScreenHeader
          title="Editar dados clínicos"
          subtitle="É o que o profissional vê no resumo do prontuário, inclusive em emergência."
          onBack={() => router.back()}
        />

        <View className="gap-6">
          <View className="gap-3">
            <SectionHeader
              title="Tipo sanguíneo"
              description="Aparece em destaque no prontuário."
            />
            <Surface>
              <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
                {bloodOptions.map((type) => {
                  const active = bloodType === type;
                  const label = type ?? "Não informado";
                  return (
                    <Pressable
                      key={label}
                      onPress={() => setBloodType(type)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active, checked: active }}
                      accessibilityLabel={
                        type ? `Tipo sanguíneo ${type}` : "Tipo sanguíneo não informado"
                      }
                      className={`min-h-touch items-center justify-center rounded-lg border px-4 ${
                        active
                          ? "border-interactive bg-interactive-subtle"
                          : "border-border bg-surface active:bg-surface-subtle"
                      }`}
                    >
                      <Text
                        className={`text-label ${
                          active
                            ? "font-bold text-interactive"
                            : "font-medium text-foreground-secondary"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Surface>
          </View>

          <ListEditor
            label="Alergias"
            description="O dado mais crítico do prontuário. Um por vez."
            placeholder="Ex.: Penicilina"
            items={allergies}
            onChange={setAllergies}
          />
          <ListEditor
            label="Condições crônicas"
            description="Diagnósticos em acompanhamento contínuo."
            placeholder="Ex.: Hipertensão arterial"
            items={chronicConditions}
            onChange={setChronicConditions}
          />
          <ListEditor
            label="Medicamentos contínuos"
            description="Inclua a dosagem quando souber."
            placeholder="Ex.: Losartana 50mg"
            items={continuousMeds}
            onChange={setContinuousMeds}
          />

          <Button
            label={saving ? "Salvando…" : "Salvar alterações"}
            loading={saving}
            disabled={saving}
            onPress={save}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
