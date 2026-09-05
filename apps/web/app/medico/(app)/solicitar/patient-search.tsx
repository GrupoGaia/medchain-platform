"use client";

import { useState } from "react";
import { Search, UserCheck, Loader2 } from "lucide-react";
import { formatCpf, normalizeCpf } from "@medchain/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldDescription, FieldError } from "@/components/ui/label";
import { PatientIdentity } from "@/components/medchain/patient-identity";

interface FoundPatient {
  id: string;
  fullName: string;
}

// Mascara progressiva, so para o campo ficar legivel enquanto o usuario digita.
// A validacao de verdade e a do dominio, no submit e de novo no servidor.
function maskCpf(value: string): string {
  const digits = normalizeCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function PatientSearch() {
  const [cpf, setCpf] = useState("");
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const complete = normalizeCpf(cpf).length === 11;

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/patients/search?cpf=${encodeURIComponent(normalizeCpf(cpf))}`
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Não foi possível buscar o paciente.");
        return;
      }
      setPatient((await response.json()) as FoundPatient);
    } catch {
      setError("Não foi possível buscar o paciente.");
    } finally {
      setLoading(false);
    }
  }

  if (patient) {
    return (
      <div className="space-y-1.5">
        <Label id="paciente-selecionado">Paciente</Label>
        <input type="hidden" name="patientId" value={patient.id} />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-interactive-border bg-interactive-subtle p-3">
          <PatientIdentity
            name={patient.fullName}
            size="sm"
            meta={
              <span className="inline-flex items-center gap-1.5">
                <UserCheck size={13} aria-hidden className="text-success" />
                {formatCpf(cpf)} · identidade confirmada
              </span>
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPatient(null);
              setCpf("");
            }}
          >
            Trocar paciente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="cpf">
        Paciente
        <span aria-hidden className="text-danger">
          *
        </span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="cpf"
          value={cpf}
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          maxLength={14}
          aria-describedby={error ? "cpf-erro" : "cpf-ajuda"}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setCpf(maskCpf(event.target.value))}
          onKeyDown={(event) => {
            // Enter aqui busca, e nao envia a solicitacao com o formulario
            // ainda sem paciente escolhido.
            if (event.key === "Enter") {
              event.preventDefault();
              if (complete) void search();
            }
          }}
        />
        <Button
          type="button"
          onClick={search}
          disabled={loading || !complete}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Search aria-hidden />
          )}
          Buscar
        </Button>
      </div>

      {error ? (
        <FieldError id="cpf-erro">{error}</FieldError>
      ) : (
        <FieldDescription id="cpf-ajuda">
          Informe o CPF completo. A busca não lista pacientes: ela apenas
          confirma o cadastro que você já conhece.
        </FieldDescription>
      )}
    </div>
  );
}
