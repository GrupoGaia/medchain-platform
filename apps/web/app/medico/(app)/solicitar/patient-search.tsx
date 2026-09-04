"use client";

import { useState } from "react";
import { Search, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { formatCpf, normalizeCpf } from "@medchain/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <Label>Paciente</Label>
        <input type="hidden" name="patientId" value={patient.id} />
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary-100 bg-primary-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
              <UserCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{patient.fullName}</p>
              <p className="text-xs text-muted-foreground">{formatCpf(cpf)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPatient(null);
              setCpf("");
            }}
          >
            Trocar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="cpf">Paciente *</Label>
      <div className="flex gap-2">
        <Input
          id="cpf"
          value={cpf}
          inputMode="numeric"
          autoComplete="off"
          placeholder="CPF do paciente"
          onChange={(event) => setCpf(maskCpf(event.target.value))}
          onKeyDown={(event) => {
            // Enter aqui busca, e nao envia a solicitacao com o formulario
            // ainda sem paciente escolhido.
            if (event.key === "Enter") {
              event.preventDefault();
              if (normalizeCpf(cpf).length === 11) void search();
            }
          }}
        />
        <Button
          type="button"
          onClick={search}
          disabled={loading || normalizeCpf(cpf).length !== 11}
          className="gap-1.5"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Buscar
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle size={16} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <p className="text-xs text-muted-foreground">
          Informe o CPF completo. A busca não lista pacientes, só confirma o que você já sabe.
        </p>
      )}
    </div>
  );
}
