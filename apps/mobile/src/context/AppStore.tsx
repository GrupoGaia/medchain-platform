import React, { createContext, useContext, useReducer } from "react";
import {
  AccessRequest,
  AccessToken,
  AccessLog,
  MOCK_ACCESS_REQUESTS,
  MOCK_TOKENS,
  MOCK_LOGS,
  MOCK_PROFESSIONALS,
} from "../services/mocks/data";

// ─── Estado ───────────────────────────────────────────────────────────────────

interface AppState {
  accessRequests: AccessRequest[];
  tokens: AccessToken[];
  logs: AccessLog[];
}

const initialState: AppState = {
  accessRequests: MOCK_ACCESS_REQUESTS,
  tokens: MOCK_TOKENS,
  logs: MOCK_LOGS,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "APPROVE_REQUEST"; requestId: string }
  | { type: "DENY_REQUEST"; requestId: string }
  | { type: "REVOKE_TOKEN"; tokenId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "APPROVE_REQUEST": {
      const request = state.accessRequests.find((r) => r.id === action.requestId);
      if (!request) return state;

      const now = new Date();
      const newToken: AccessToken = {
        id: `token-${Date.now()}`,
        requestId: request.id,
        professional: request.professional,
        scope: request.scope,
        expiresAt: new Date(now.getTime() + request.durationMinutes * 60_000),
        status: "ACTIVE",
      };

      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        eventType: "APPROVE",
        description: "Acesso autorizado",
        professional: `${request.professional.name} — ${request.professional.crm}`,
        createdAt: "Agora",
      };

      return {
        ...state,
        accessRequests: state.accessRequests.map((r) =>
          r.id === action.requestId ? { ...r, status: "APPROVED" } : r
        ),
        tokens: [...state.tokens, newToken],
        logs: [newLog, ...state.logs],
      };
    }

    case "DENY_REQUEST": {
      const request = state.accessRequests.find((r) => r.id === action.requestId);
      if (!request) return state;

      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        eventType: "DENY",
        description: "Acesso negado",
        professional: `${request.professional.name} — ${request.professional.crm}`,
        createdAt: "Agora",
      };

      return {
        ...state,
        accessRequests: state.accessRequests.map((r) =>
          r.id === action.requestId ? { ...r, status: "DENIED" } : r
        ),
        logs: [newLog, ...state.logs],
      };
    }

    case "REVOKE_TOKEN": {
      const token = state.tokens.find((t) => t.id === action.tokenId);
      if (!token) return state;

      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        eventType: "REVOKE",
        description: "Acesso revogado pelo paciente",
        professional: `${token.professional.name} — ${token.professional.crm}`,
        createdAt: "Agora",
      };

      return {
        ...state,
        tokens: state.tokens.map((t) =>
          t.id === action.tokenId
            ? { ...t, status: "REVOKED", revokedAt: new Date() }
            : t
        ),
        logs: [newLog, ...state.logs],
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  approveRequest: (requestId: string) => void;
  denyRequest: (requestId: string) => void;
  revokeToken: (tokenId: string) => void;
  activeTokens: AccessToken[];
  pendingRequests: AccessRequest[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const activeTokens = state.tokens.filter(
    (t) => t.status === "ACTIVE" && t.expiresAt > new Date()
  );

  const pendingRequests = state.accessRequests.filter(
    (r) => r.status === "PENDING"
  );

  return (
    <AppContext.Provider
      value={{
        state,
        approveRequest: (id) => dispatch({ type: "APPROVE_REQUEST", requestId: id }),
        denyRequest: (id) => dispatch({ type: "DENY_REQUEST", requestId: id }),
        revokeToken: (id) => dispatch({ type: "REVOKE_TOKEN", tokenId: id }),
        activeTokens,
        pendingRequests,
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
