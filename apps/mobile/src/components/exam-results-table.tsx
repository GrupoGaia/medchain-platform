import React from "react";
import { View } from "react-native";
import { isOutOfRange } from "@medchain/domain";
import { Text } from "./text";
import type { ExamResultResponse } from "../services/api";

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export function ExamResultsTable({ results }: { results: ExamResultResponse[] }) {
  if (results.length === 0) return null;

  return (
    <View className="mt-3 border-t border-gray-100 pt-3">
      <View className="flex-row pb-2">
        <Text className="flex-1 text-xs font-medium text-gray-400">Analito</Text>
        <Text className="flex-1 text-xs font-medium text-gray-400">Valor</Text>
        <Text className="flex-1 text-xs font-medium text-gray-400">Referência</Text>
      </View>
      {results.map((result) => {
        const outOfRange = isOutOfRange(result.value, result.referenceMin, result.referenceMax);
        return (
          <View
            key={result.id}
            className={`flex-row rounded-md px-1 py-1.5 ${outOfRange ? "bg-amber-50" : ""}`}
          >
            <Text className="flex-1 text-xs text-gray-600">{result.analyte}</Text>
            <Text
              className={`flex-1 text-xs ${outOfRange ? "font-semibold text-amber-700" : "text-gray-900"}`}
            >
              {formatNumber(result.value)} {result.unit}
            </Text>
            <Text className="flex-1 text-xs text-gray-400">
              {formatNumber(result.referenceMin)} a {formatNumber(result.referenceMax)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
