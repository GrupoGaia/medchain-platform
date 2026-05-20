import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabase";
import {
  api,
  type AccessRequestResponse,
  type AccessTokenResponse,
  type AuditLogResponse,
} from "../services/api";

// ─── Estado ───────────────────────────────────────────────────────────────────

interface AppState {
  accessRequests: AccessRequestResponse[];
  tokens: AccessTokenResponse[];
  logs: AuditLogResponse[];
  loading: boolean;
}

const initialState: AppState = {
  accessRequests: [],
  tokens: [],
  logs: [],
  loading: true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  approveRequest: (requestId: string) => Promise<void>;
  denyRequest: (requestId: string) => Promise<void>;
  revokeToken: (tokenId: string) => Promise<void>;
  activeTokens: AccessTokenResponse[];
  pendingRequests: AccessRequestResponse[];
  refetch: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [requests, tokens, logs] = await Promise.all([
        api.getAllRequests(),
        api.getActiveTokens(),
        api.getAuditLogs(),
      ]);
      setState({ accessRequests: requests, tokens, logs, loading: false });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchAll();
      else setState({ ...initialState, loading: false });
    });

    // Fetch imediato se já há sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchAll();
      else setState({ ...initialState, loading: false });
    });

    return () => subscription.unsubscribe();
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
