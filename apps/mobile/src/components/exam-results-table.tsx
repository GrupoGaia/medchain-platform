import React from "react";
import { View } from "react-native";
import { ArrowUp, ArrowDown, Minus } from "lucide-react-native";
import { isOutOfRange } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";
import type { ExamResultResponse } from "../services/api";

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/**
 * Resultados laboratoriais do documento.
 *
 * A avaliação diz apenas se o valor está dentro ou fora da faixa de referência
 * que veio com o resultado. Não é diagnóstico e não classifica gravidade.
 *
 * Fora da faixa nunca é comunicado só pelo fundo: cada linha traz seta e texto.
 */
export function ExamResultsTable({ results }: { results: ExamResultResponse[] }) {
  if (results.length === 0) return null;

  return (
    <View className="mt-3 overflow-hidden rounded-lg border border-border">
      <View className="flex-row bg-surface-subtle px-3 py-2">
        <Text className="flex-1 text-overline font-semibold uppercase text-foreground-tertiary">
          Analito
        </Text>
        <Text className="w-24 text-right text-overline font-semibold uppercase text-foreground-tertiary">
          Resultado
        </Text>
      </View>

      {results.map((result, index) => {
        const outOfRange = isOutOfRange(
          result.value,
          result.referenceMin,
          result.referenceMax
        );
        const isHigh = result.value > result.referenceMax;
        const Icon = outOfRange ? (isHigh ? ArrowUp : ArrowDown) : Minus;
        const tone = outOfRange
          ? colors.status.warning.fg
          : colors.semantic.textTertiary;

        return (
          <View
            key={result.id}
            accessible
            accessibilityLabel={`${result.analyte}: ${formatNumber(result.value)} ${
              result.unit
            }. Faixa de referência de ${formatNumber(
              result.referenceMin
            )} a ${formatNumber(result.referenceMax)}. ${
              outOfRange
                ? isHigh
                  ? "Acima da faixa"
                  : "Abaixo da faixa"
                : "Dentro da faixa"
            }.`}
            className={`px-3 py-2.5 ${outOfRange ? "bg-warning-subtle" : "bg-surface"} ${
              index > 0 ? "border-t border-border-subtle" : ""
            }`}
          >
            <View className="flex-row items-center">
              <Text className="flex-1 text-body-sm font-medium text-foreground">
                {result.analyte}
              </Text>
              <Text
                className={`w-24 text-right text-body-sm ${
                  outOfRange ? "font-semibold text-warning" : "text-foreground-secondary"
                }`}
              >
                {formatNumber(result.value)} {result.unit}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Icon size={12} color={tone} />
              <Text
                className={`text-caption ${
                  outOfRange ? "font-medium text-warning" : "text-foreground-tertiary"
                }`}
              >
                {outOfRange
                  ? isHigh
                    ? "Acima da faixa"
                    : "Abaixo da faixa"
                  : "Dentro da faixa"}
                {"  ·  "}
                Referência {formatNumber(result.referenceMin)}–
                {formatNumber(result.referenceMax)} {result.unit}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
