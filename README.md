# medchain-platform

Monorepo principal do MedChain. Contém o app mobile do paciente/familiar, o portal web do médico, packages compartilhados e a API.

## Pré-requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- Docker Desktop
- Android Studio com Android SDK, Android Emulator e um AVD criado
- Expo Go instalado no Android Emulator
- Supabase CLI, disponível via `npx supabase`

## Instalação inicial

Na raiz do repositório:

```powershell
pnpm install
```

Crie os arquivos locais de ambiente somente se ainda não existirem:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
Copy-Item apps/mobile/.env.example apps/mobile/.env.local
```

Preencha as variáveis conforme o ambiente usado. Nunca versione `.env`, `.env.local` ou chaves do Supabase.

## Rodar com Android Emulator + Expo Go

### 1. Iniciar o emulador

No Android Studio, abra `More Actions > Virtual Device Manager`, crie um AVD de telefone Pixel e inicie-o. Confirme no PowerShell:

```powershell
adb devices
```

O dispositivo deve aparecer com o estado `device`.

### 2. Instalar e abrir o Expo Go

Dentro do emulador, abra a Play Store, instale o `Expo Go` e deixe o aplicativo disponível para o comando do Expo.

### 3. Redirecionar as portas locais

Como o `.env.local` do mobile usa `localhost` no ambiente local, redirecione as portas do emulador para o Windows:

```powershell
adb -s emulator-5554 reverse tcp:3000 tcp:3000
adb -s emulator-5554 reverse tcp:54321 tcp:54321
adb -s emulator-5554 reverse tcp:8081 tcp:8081
```

Se o identificador do emulador for diferente, use o valor mostrado por `adb devices`.

> [!NOTE]
> Outra opção é usar `10.0.2.2` nas URLs do mobile. Para um celular físico, use o IP da máquina na rede local, não `localhost`.

### 4. Iniciar o Supabase local

Na raiz do projeto:

```powershell
npx supabase start
```

Na primeira execução, o Docker pode baixar alguns GB de imagens.

### 5. Aplicar migrations e seed

A partir de `apps/web`:

```powershell
Set-Location apps/web
node_modules/.bin/prisma migrate deploy
node_modules/.bin/tsx prisma/seed.ts
```

O seed cria usuários, instituições, documentos e solicitações de demonstração.

### 6. Iniciar web e mobile

Use dois terminais, ambos na raiz do projeto.

Terminal web/API:

```powershell
pnpm --filter @medchain/web dev
```

Terminal mobile:

```powershell
pnpm --filter @medchain/mobile android
```

O Expo inicia o Metro, abre o projeto no Expo Go e conecta ao AVD. Também é possível executar `pnpm --filter @medchain/mobile dev` e pressionar `a` no terminal do Expo.

### Credenciais de demonstração

A senha dos usuários de exemplo é `medchain123`.

| Email | Perfil |
|---|---|
| `carlos.silva@medchain.demo` | Médico, Cardiologia |
| `ana.ferreira@medchain.demo` | Médico, Clínica Geral |
| `paulo.mendes@medchain.demo` | Médico, Endocrinologia |
| `joao.batista@exemplo.com` | Paciente |
| `maria.batista@exemplo.com` | Contato de emergência |
| `pedro.batista@exemplo.com` | Contato de emergência |

## Serviços locais

| Serviço | URL |
|---|---|
| Web/API | `http://localhost:3000` |
| Supabase API | `http://localhost:54321` |
| Supabase Studio | `http://localhost:54323` |
| Mailpit | `http://localhost:54324` |
| Expo Metro | `http://localhost:8081` |

## Estrutura

```text
apps/
  mobile/        Expo + React Native + NativeWind (paciente e familiar)
  web/           Next.js 15 App Router + Tailwind + shadcn/ui (médico)
packages/
  api-contract/  Schemas Zod compartilhados entre mobile e web
  domain/        Regras de negócio: tokens, autorização e auditoria
  ui-tokens/     Paleta de cores, tipografia e espaçamentos
  config/        Configurações base de ESLint, TypeScript e Prettier
prisma/
  schema.prisma  Modelo de dados de referência
```

## Comandos úteis

```powershell
pnpm lint          # lint em todos os apps e packages
pnpm typecheck     # checagem de tipos em todos
pnpm test          # testes em todos
pnpm build         # build completo
pnpm dev           # web e mobile juntos, sem substituir o setup do AVD
```

Para encerrar o Supabase local:

```powershell
npx supabase stop
```

## Solução de problemas

Se `adb` não for encontrado, confirme que estes diretórios estão no `Path` do usuário do Windows:

```text
C:\Users\<usuario>\AppData\Local\Android\Sdk\platform-tools
C:\Users\<usuario>\AppData\Local\Android\Sdk\emulator
```

Se o Metro falhar com `EACCES` ao fazer `lstat` em caminhos como `packages\*\node_modules\.ignored_*`, o problema está em junctions gerados pelo pnpm no Windows. Remova somente os junctions `.ignored_*` indicados pelo erro e reinicie o Expo. Não remova diretórios de packages nem o `node_modules` inteiro sem confirmar o diagnóstico.

## Documentação

A documentação funcional, arquitetura, roadmap e decisões ficam no repositório separado:

`C:\Users\0\Desktop\Projetos\TCC\medchain-docs`
