# MedChain — Roadmap de Implementação

## Estado atual

| Fase | Status | Descrição |
|---|---|---|
| Fase 0 | ✅ Concluída | Monorepo Turborepo, Next.js, Expo, packages compartilhados, CI |
| Fase 1 | ✅ Concluída | Protótipo mobile navegável com mocks (AppStore, tela de autorização) |
| Fase 2 | ⏳ Próxima | API REST, banco de dados Supabase, portal médico web |
| Fase 3 | — | Autenticação e controle de perfis |
| Fase 4 | — | Documentos médicos e storage |
| Fase 5 | — | Qualidade, observabilidade e roteiro de demo |
| Fase 6 | — | Pós-MVP (opcional, após apresentação) |

---

## Fase 2 — API, banco e portal médico

**Objetivo:** trocar os mocks por dados reais persistidos e habilitar o lado do médico.

**Duração estimada:** 2 semanas

### Banco de dados (Supabase + Prisma)

- Criar projeto no [Supabase](https://supabase.com) (free tier)
- Copiar a connection string para `apps/web/.env.local`:
  ```
  DATABASE_URL="postgresql://..."
  DIRECT_URL="postgresql://..."
  ```
- Aplicar o schema já existente em `prisma/schema.prisma`:
  ```powershell
  pnpm --filter @medchain/web exec npx prisma migrate dev --name init
  ```
- Habilitar RLS nas tabelas expostas (policies permissivas por ora)
- Rodar o seed de dados fictícios:
  ```powershell
  pnpm --filter @medchain/web exec npx prisma db seed
  ```

### Endpoints REST (Next.js Route Handlers)

Criar em `apps/web/app/api/`:

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/access-requests` | Médico cria solicitação |
| GET | `/api/access-requests/[id]` | Detalhes da solicitação |
| POST | `/api/access-requests/[id]/approve` | Paciente/familiar aprova |
| POST | `/api/access-requests/[id]/deny` | Paciente/familiar nega |
| POST | `/api/tokens/[id]/revoke` | Paciente revoga token |
| GET | `/api/audit-logs` | Histórico de acessos |
| GET | `/api/patients/[id]/documents` | Lista documentos do paciente |

Todos os schemas de request/response usam os Zod schemas de `packages/api-contract/`.

### Seed de dados

Arquivo `prisma/seed.ts` com `@faker-js/faker` (pt_BR):
- 5 pacientes fictícios (incluindo João Batista dos mocks)
- 3 médicos em 2 instituições
- 20 documentos médicos (laudos, receitas, exames)
- 1 solicitação pendente e 1 token ativo (para demo imediata)

### Portal médico web

Telas em `apps/web/app/(medico)/`:
- `/medico/dashboard` — lista de pacientes com token ativo e solicitações enviadas
- `/medico/solicitar` — formulário para criar nova solicitação de acesso
- `/medico/prontuario/[patientId]` — documentos visíveis enquanto o token está ativo

### Mobile consome a API real

- Substituir os mocks de `AppStore.tsx` por chamadas ao cliente HTTP (`apps/mobile/src/services/api.ts`)
- Variável de ambiente `EXPO_PUBLIC_API_URL` apontando para o Next.js local (`http://<IP-LOCAL>:3000`)

### Definition of Done

- Médico no portal web cria solicitação → mobile mostra banner âmbar → familiar aprova → token aparece no banco → médico vê documentos → `AccessLog` registrado
- Token expira automaticamente (verificação no acesso, sem job externo no MVP)
- Revogação manual bloqueia novo acesso imediatamente
- Acesso com token expirado ou inexistente retorna 401

---

## Fase 3 — Autenticação e controle de perfis

**Objetivo:** separar perfis e proteger as rotas.

**Duração estimada:** 1 semana

### O que implementar

- Supabase Auth com login por email/senha
- Perfis: `PATIENT`, `EMERGENCY_CONTACT`, `HEALTH_PROFESSIONAL`, `ADMIN`
- Middleware Next.js protegendo `/medico/*` para `HEALTH_PROFESSIONAL`
- Mobile armazena sessão em `expo-secure-store` (nunca `AsyncStorage`)
- RLS no Supabase com policies por perfil:
  - Paciente só vê seus próprios dados
  - Médico só vê pacientes com token ativo para ele
  - Contato de emergência só vê pedidos endereçados a ele
- Telas: login, cadastro (dados fictícios para demo), seleção de perfil

### Definition of Done

- Médico não consegue ver dados de paciente sem token válido, nem direto na API
- Paciente não consegue listar outros pacientes
- Sessão persiste ao fechar e reabrir o app
- Logout limpa sessão de fato (sem token residual no secure store)

---

## Fase 4 — Documentos médicos e storage

**Objetivo:** anexar exames e laudos ao prontuário.

**Duração estimada:** 1 semana

### O que implementar

- Bucket privado no Supabase Storage com policy de acesso via token ativo
- Endpoint `POST /api/documents` — gera URL assinada para upload
- Endpoint `GET /api/documents/[id]` — download protegido (valida token ativo)
- Tela paciente: visualizar e anexar exame (PDF ou imagem)
- Tela médico: listar e abrir documentos enquanto o token está ativo
- Seed gera PDFs fictícios com `pdf-lib` (laudos, receitas, hemogramas)

### Definition of Done

- Paciente faz upload de um PDF e visualiza na lista
- Médico baixa o documento enquanto o token está ativo
- Após expiração ou revogação, download retorna 401
- Nenhuma URL de storage exposta sem autenticação

---

## Fase 5 — Qualidade, observabilidade e demo

**Objetivo:** deixar o projeto demonstrável e à prova de falhas na apresentação.

**Duração estimada:** 1 semana

### O que implementar

**Testes**

- Vitest unitário em `packages/domain/` para regras de token:
  - Criação com tempo de expiração correto
  - `validateToken()` retorna false para expirado/revogado
  - `formatMinutesRemaining()` formata corretamente
- Teste de integração do fluxo crítico (API): solicitação → aprovação → token → acesso → log
- 1 teste E2E (Playwright) no portal web: solicitar → abrir prontuário → revogar → acesso bloqueado

**Observabilidade**

- Sentry configurado em mobile e web (free tier, DSN em variável de ambiente)
- Logger estruturado na API (`pino` ou `console.log` em JSON) com campos: `requestId`, `userId`, `action`
- Verificar erro de teste chegando no Sentry antes da demo

**Deploy e demo**

- Portal web deployado na Vercel com domínio temporário
- Variáveis de ambiente configuradas no painel da Vercel
- Roteiro de demo em `docs/demo-roteiro.md` (passos cronometrados, 10 minutos)
- Ensaio do roteiro com pessoa de fora do grupo
- Build do mobile publicado via Expo Go para o grupo

### Definition of Done

- `pnpm test` passa em CI (GitHub Actions)
- Sentry recebe erro de teste enviado manualmente
- Roteiro de demo executado por outra pessoa sem travar
- Portal web em produção responde em menos de 3 segundos na primeira tela
- Nenhum dado real de paciente aparece (apenas seed fictício)

---

## Fase 6 — Pós-MVP (opcional, após apresentação)

Só se houver tempo ou se o projeto continuar além da entrega acadêmica.

| Item | Descrição |
|---|---|
| WhatsApp Business | Integração real com a API do WhatsApp para notificar familiar |
| Push notifications | Expo Notifications para avisar paciente de novo pedido |
| HL7/FHIR | Adaptadores para importar prontuários de outros sistemas |
| Dashboards BI | Metabase conectado ao Supabase para análise de uso |
| Backend dedicado | NestJS ou Hono se a API crescer além do Route Handlers |
| Filas | BullMQ + Redis para expiração automática de tokens em escala |
| EAS Build | APK/IPA para publicação na Play Store e App Store |

---

## Checklist de verificação ponta a ponta (executar ao fim de cada fase)

1. `pnpm install && pnpm dev` sobe tudo sem erro
2. `pnpm lint && pnpm typecheck` passa nos dois apps e em todos os packages
3. `pnpm test` passa (a partir da Fase 5)
4. Fluxo manual: médico cria solicitação → familiar aprova → médico vê dados → paciente vê log
5. Token expirado retorna 401
6. Revisar limites de uso no dashboard do Supabase (free tier pausa por inatividade)
7. Demo cronometrada de 10 minutos com pessoa de fora do grupo

---

## Comandos úteis de referência

```powershell
# Desenvolvimento
pnpm dev                                          # sobe mobile + web juntos
cd apps/mobile && npx expo start --clear          # mobile com cache limpo

# Banco de dados
pnpm --filter @medchain/web exec npx prisma migrate dev --name <nome>
pnpm --filter @medchain/web exec npx prisma db seed
pnpm --filter @medchain/web exec npx prisma studio  # GUI do banco

# Qualidade
pnpm lint
pnpm typecheck
pnpm test

# Deploy web
# Push para main → Vercel faz deploy automático (configurar webhook no painel)
```
