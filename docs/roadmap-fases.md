# MedChain — Roadmap de Implementação

## Estado atual

| Fase | Status | Descrição |
|---|---|---|
| Fase 0 | ✅ Concluída | Monorepo Turborepo, Next.js, Expo, packages compartilhados, CI |
| Fase 1 | ✅ Concluída | Protótipo mobile navegável com mocks (AppStore, tela de autorização) |
| Fase 2 | ✅ Concluída | API REST, banco migrado no Supabase, portal médico web funcional |
| Fase 3 | — | Autenticação e controle de perfis |
| Fase 4 | — | Documentos médicos e storage |
| Fase 5 | — | Qualidade, observabilidade e roteiro de demo |
| Fase 6 | — | Pós-MVP (opcional, após apresentação) |

---

## Fase 2 — API, banco e portal médico ✅

**Status:** Concluída em 2026-05-15.

### O que foi implementado

#### Infraestrutura de banco
- Schema Prisma em `apps/web/prisma/schema.prisma` (10 entidades: User, PatientProfile, EmergencyContact, HealthProfessionalProfile, Institution, MedicalDocument, AccessRequest, AccessToken, AccessLog + enums)
- Migration `20260515121448_init` aplicada no Supabase
- `apps/web/lib/prisma.ts`: singleton PrismaClient com padrão global para hot reload
- `apps/web/lib/session.ts`: cookie `medchain_doctor_id` (sessão provisória — substituída na Fase 3)

#### Seed (`apps/web/prisma/seed.ts`)
- 2 instituições (Hospital São Lucas, UPA Centro)
- 3 médicos (Carlos Silva/Cardiologia, Ana Ferreira/Clínica Geral, Paulo Mendes/Endocrinologia)
- 5 pacientes (João Batista + 4 com faker pt_BR)
- 20 documentos médicos distribuídos
- 3 solicitações: 1 aprovada + token ativo (45min), 1 pendente, 1 expirada
- Logs de auditoria correspondentes

**IDs para demo:**
- João Batista (patientProfileId): `255cd166-4ea8-4698-8224-c2189ba029e8`
- Dr. Carlos Silva (profileId): `95e8dc16-93a4-4bb3-afad-6e592272aaec`
- Token ativo: `54edbe18-f3e6-410a-bd11-95b87f5651a9`

#### Route Handlers (`apps/web/app/api/`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/access-requests` | Médico cria solicitação |
| GET  | `/api/access-requests/[id]` | Detalhes da solicitação |
| POST | `/api/access-requests/[id]/approve` | Paciente/familiar aprova → gera token |
| POST | `/api/access-requests/[id]/deny` | Paciente/familiar nega |
| POST | `/api/tokens/[id]/revoke` | Revoga token ativo |
| GET  | `/api/audit-logs` | Histórico (`?patientId=`, `take: 50`) |
| GET  | `/api/patients/[id]/documents` | Docs do paciente (`?professionalId=`, valida token) |

#### Portal médico (`apps/web/app/medico/`)
- `/medico/login` — seleção de médico (provisório, substituído na Fase 3)
- `/medico/dashboard` — tokens ativos com minutos restantes, solicitações pendentes
- `/medico/solicitar` — formulário com server action que cria `AccessRequest` no banco
- `/medico/prontuario/[patientId]` — dados do paciente, documentos, banner de expiração, revogar

### Decisões e gotchas desta fase

- **Schema em `apps/web/prisma/`** (não na raiz): sem a chave `"schema"` no `package.json#prisma`, o Prisma usa o local padrão e o auto-install funciona a partir de `apps/web/`. Com a chave apontando para `../../`, o `pnpm add --silent` falhava porque rodava da raiz do workspace.
- **Seed no Windows**: `prisma db seed` roda via cmd.exe sem `node_modules/.bin` no PATH. O `package.json` usa `node_modules/.bin/tsx prisma/seed.ts`. Para rodar manualmente: `node_modules/.bin/tsx prisma/seed.ts` de dentro de `apps/web/`.
- **Dois arquivos de env obrigatórios**: `.env` (lido pelo Prisma CLI — só `DATABASE_URL` e `DIRECT_URL`) e `.env.local` (lido pelo Next.js — também tem `NEXT_PUBLIC_*`). Senha URL-encoded: `%3A` para `:`, `%26` para `&`.
- **Log de ACCESS no prontuário**: criado a cada carregamento (`append-only`, comportamento correto de auditoria).
- **Expiração lazy**: sem job externo — token é marcado como `EXPIRED` na primeira tentativa de acesso após `expiresAt`.

### O que ficou de fora (intencional — Fase 3)
- Mobile ainda usa mocks (`AppStore.tsx`); integração com API real depende das env vars do Supabase configuradas
- Autenticação real: login provisório por cookie sem senha

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

# Banco de dados — rodar de dentro de apps/web/
cd apps/web
node_modules/.bin/prisma migrate dev --name <nome>
node_modules/.bin/tsx prisma/seed.ts              # seed direto (mais confiável no Windows)
node_modules/.bin/prisma studio                   # GUI do banco

# Qualidade
pnpm lint
pnpm typecheck
pnpm test

# Deploy web
# Push para main → Vercel faz deploy automático (configurar webhook no painel)
```
