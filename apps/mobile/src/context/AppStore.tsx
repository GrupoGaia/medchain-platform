import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { AppState as RnAppState, type AppStateStatus } from "react-native";
import { supabase } from "../services/supabase";
import {
  api,
  type AccessRequestResponse,
  type AccessTokenResponse,
  type AuditLogResponse,
} from "../services/api";
import { startRequestPolling } from "./request-polling";
import { awaitsContactApproval, deniesPatientData } from "./contact-approval";

// ─── Estado ───────────────────────────────────────────────────────────────────

interface AppState {
  accessRequests: AccessRequestResponse[];
  tokens: AccessTokenResponse[];
  logs: AuditLogResponse[];
  loading: boolean;
  /**
   * Conta de contato de emergência cujo vínculo o paciente ainda não respondeu.
   * Enquanto for verdadeiro não existe dado nenhum para mostrar, e as telas
   * precisam explicar a espera em vez de aparecerem vazias.
   */
  awaitingContactApproval: boolean;
}

const initialState: AppState = {
  accessRequests: [],
  tokens: [],
  logs: [],
  loading: true,
  awaitingContactApproval: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  approveRequest: (requestId: string) => Promise<void>;
  denyRequest: (requestId: string) => Promise<void>;
  revokeToken: (tokenId: string) => Promise<void>;
  activeTokens: AccessTokenResponse[];
  pendingRequests: AccessRequestResponse[];
  awaitingContactApproval: boolean;
  refetch: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// Fora do provider porque não depende de estado: é só a segunda pergunta que o
// 403 obriga a fazer. Se nem os vínculos carregarem, o app não sabe de nada e
// não afirma espera nenhuma.
async function hasPendingLink(): Promise<boolean> {
  try {
    return awaitsContactApproval(await api.getMyContactLinks());
  } catch {
    return false;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const inFlightRef = useRef(false);

  const fetchAll = useCallback(async (options?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (!options?.silent) {
      setState((s) => ({ ...s, loading: true }));
    }
    try {
      const [requests, tokens, logs] = await Promise.all([
        api.getAllRequests(),
        api.getActiveTokens(),
        api.getAuditLogs(),
      ]);
      setState({
        accessRequests: requests,
        tokens,
        logs,
        loading: false,
        awaitingContactApproval: false,
      });
    } catch (error) {
      // O 403 aqui é esperado para contato de emergência ainda não aprovado, e
      // é a única pista que o app tem: as rotas de dados do paciente negam tudo
      // antes de contar por quê. Os vínculos da própria conta continuam
      // legíveis e confirmam a causa.
      const awaiting = deniesPatientData(error) ? await hasPendingLink() : false;
      setState((s) => ({ ...s, loading: false, awaitingContactApproval: awaiting }));
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let polling: { stop: () => void } | undefined;

    const startPolling = () => {
      if (polling) return;
      polling = startRequestPolling({
        refresh: () => fetchAll({ silent: true }),
        isSessionActive: () => true,
        intervalMs: 8000,
        subscribeAppState: (listener) => {
          const sub = RnAppState.addEventListener("change", (next: AppStateStatus) => {
            listener(next);
          });
          return () => sub.remove();
        },
      });
    };

    const stopPolling = () => {
      polling?.stop();
      polling = undefined;
    };

    const applySession = (hasSession: boolean) => {
      if (stopped) return;
      if (hasSession) {
        const alreadyPolling = Boolean(polling);
        startPolling();
        if (!alreadyPolling) void fetchAll();
        return;
      }
      stopPolling();
      setState({ ...initialState, loading: false });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(Boolean(session));
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(Boolean(session));
    });

    return () => {
      stopped = true;
      stopPolling();
      subscription.unsubscribe();
    };
  }, [fetchAll]);

  const approveRequest = useCallback(
    async (requestId: string) => {
      await api.approveRequest(requestId);
      await fetchAll();
    },
    [fetchAll]
  );

  const denyRequest = useCallback(
    async (requestId: string) => {
      await api.denyRequest(requestId);
      await fetchAll();
    },
    [fetchAll]
  );

  const revokeToken = useCallback(
    async (tokenId: string) => {
      await api.revokeToken(tokenId);
      await fetchAll();
    },
    [fetchAll]
  );

  const now = new Date();
  const activeTokens = state.tokens.filter(
    (t) => t.status === "ACTIVE" && new Date(t.expiresAt) > now
  );
  const pendingRequests = state.accessRequests.filter((r) => r.status === "PENDING");

  return (
    <AppContext.Provider
      value={{
        state,
        approveRequest,
        denyRequest,
        revokeToken,
        activeTokens,
        pendingRequests,
        awaitingContactApproval: state.awaitingContactApproval,
        refetch: fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore deve ser usado dentro de AppStoreProvider");
  return ctx;
}
