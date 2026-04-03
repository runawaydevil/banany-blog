# Plano: endurecimento de segurança + primeiro deploy em produção

Este documento traduz o prompt de hardening para o estado **real** do repositório Banany Blog e define a ordem de execução. **Não substitui** a auditoria pós-implementação em [`security-audit.md`](./security-audit.md) (a criar/atualizar durante o trabalho).

---

## Baseline actual (correcção de premissas do prompt)

- **Mailgun:** credenciais **apenas em variáveis de ambiente** (`MAILGUN_*`), não em `SiteSettings`. A parte “mascarar API key na UI” aplica-se sobretudo a **não expor segredos em logs/HTML** e a **readiness** no painel (já existe estado booleano).
- **Auth:** `bcryptjs` em `authorize`, setup e reset (`hash`, cost 12). **Sem** rate limiting explícito.
- **Reset password:** token `nanoid(48)` persistido **em claro** em `PasswordResetToken.token` — risco elevado se a BD for lida.
- **Upload:** autenticado; limite 15MB; confia em `file.type`; **SVG** e fontes; **`prefix` do cliente** entra na chave S3.
- **`/api/media/raw`:** GET público com `?key=` **sem** validação contra a tabela `Media` — risco de acesso a objectos se a chave for conhecida.
- **Headers/CSP:** `next.config.ts` mínimo (`standalone` apenas).
- **Dashboard:** protegido por `auth()` no layout; APIs devem ser inventariadas para garantir `auth()` + validação em **todas** as mutações.
- **Deploy:** já existem `docker-compose.prod.yml`, `docs/deploy-external-reverse-proxy.md`, `.env.production.example` — **estender** com health, backup, primeiro deploy e hardening.

---

## Fase 1 — Auditoria obrigatória

**Entregável:** [`docs/security-audit.md`](./security-audit.md)

- Percorrer: `auth.ts`, fluxos login/forgot/reset, `middleware.ts`, layouts dashboard, todas as rotas `app/api/**`, upload, `media/raw`, `icon`, sanitização HTML, `docker-compose*.yml`, `Dockerfile`, `docker-entrypoint.sh`, `instrumentation.ts`, variáveis de ambiente e possíveis fugas para cliente/logs.
- Classificar cada achado: **Critical / High / Medium / Low**, com ficheiro e comportamento concreto.
- Actualizar o documento à medida que issues forem corrigidas (estado: aberto / corrigido / aceite com mitigação documentada).

---

## Fase 2 — Passwords e reset (prioridade máxima)

1. **`lib/auth/password.ts`:** Argon2id como primário; detectar hashes legacy `$2a/`/`$2b/` e verificar com bcrypt; **rehash Argon2id** após login bem-sucedido com legacy.
2. **Setup e reset:** novos hashes sempre Argon2id.
3. **Tokens de reset:** armazenar **apenas hash** (ex. SHA-256 de um segredo aleatório em bytes); URL continua a levar o segredo em claro uma vez; lookup por `tokenHash`; expiração + **uso único** (delete após reset). **Migração Prisma** (substituir ou migrar coluna `token`).
4. **Forgot password:** manter respostas **uniformes** (anti-enumeração); **rate limit** por IP (e opcionalmente fingerprint do email).
5. **Reset POST:** rate limit; mensagem genérica; **não** estabelecer sessão automática (confirmar `reset-password` page).
6. **NextAuth / cookies:** rever `useSecureCookies`, `SameSite`, `path` em produção; alinhar com proxy TLS (`trustHost` já presente). `AUTH_SECRET` já validado em `instrumentation.ts` em produção.

**Testes:** `lib/auth/password.test.ts`; testes de ciclo de vida do token (válido / expirado / reuso).

**Docs:** secção em `docs/security-hardening.md` (novo).

---

## Fase 3 — Uploads, S3, media raw

- **Prefix:** allowlist estrita (`uploads`, `branding`, `fonts` — definir lista fechada); rejeitar `..`, barras extras, unicode suspeito.
- **Tipo:** validar **magic bytes** após ler buffer; não confiar só no `Content-Type` do cliente.
- **SVG:** política explícita — preferência **bloquear** upload SVG no produto ou sanitizar/servir de forma segura; documentar decisão.
- **GIF / outros:** política explícita (converter, recusar, ou aceitar com risco documentado).
- **`/api/media/raw`:** servir apenas se `key` existir em `Media` (lookup Prisma) **ou** introduzir URLs assinadas (v2); validar formato de `key`.
- **Headers resposta:** `Content-Type` correcto; `Content-Disposition` onde fizer sentido; cache só após validação.

**Testes:** validação de prefix, rejeição sem linha `Media`, tipos inválidos.

---

## Fase 4 — Headers, CSP, HTML

- Adicionar via `next.config.ts` `headers()` (e/ou middleware segmentado): `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` ou CSP `frame-ancestors`, **HSTS** condicionado a env (ex. `BANANY_BEHIND_HTTPS_PROXY=1`) para não partir dev HTTP.
- **CSP:** política **realista** para Next 15 + TipTap; se `unsafe-inline` for inevitável na v1, documentar em `docs/security-hardening.md` ou `docs/csp-notes.md` e considerar CSP report-only ou políticas distintas público vs `/dashboard`.
- Rever `dangerouslySetInnerHTML` + `sanitize-html`; `customCss` como risco aceite pelo dono (documentar self-XSS consciente).
- Links `target="_blank"`: `rel="noopener noreferrer"`.
- Opcional: `noindex` em `/setup`, `/login`, `/dashboard` via metadata.

---

## Fase 5 — APIs, rate limits, CSRF

- Inventário de **todas** as mutações em `app/api/**`: garantir **`auth()`** onde for admin + **Zod** (ou equivalente).
- **`lib/rate-limit.ts`:** implementação **in-memory** (v1) com TTL; chave por IP (headers `x-forwarded-for` / `x-real-ip`). Aplicar a: tentativas de login (estratégia: limitar no fluxo que processa credenciais — pode exigir ajuste arquitectural mínimo), forgot, reset, `POST /api/subscribers`, `POST /api/upload`.
- Documentar modelo **CSRF**: cookies `SameSite`, same-origin; checagens opcionais `Origin`/`Referer` em rotas sensíveis.
- Rever redirects e `callbackUrl` (já endurecido em `lib/callback-url.ts`).

---

## Fase 6 — Base de dados, segredos, backups

- Confirmar compose prod: **sem** portas públicas DB/MinIO por defeito; passwords fortes só em env não commitado.
- Documentar **Docker secrets** / ficheiros com permissões restritas.
- Documentar **`prisma db push` vs `migrate deploy`** para produção.
- **Novo:** `docs/ops-backup-restore.md` (Postgres, volumes MinIO, ordem de restore).

---

## Fase 7 — Docker, proxy, primeiro deploy

- **Dockerfile:** `HEALTHCHECK` apontando a `/api/health` (novo endpoint mínimo `{ ok: true }`).
- **Novos/actualizados:** `docs/deploy-first-production.md` (pré-requisitos, DNS, TLS, env, compose, migração, setup, smoke, rollback).
- Estender `docs/deploy-external-reverse-proxy.md` (body size, timeouts, headers no edge).

---

## Fase 8 — Mailgun (env)

- Garantir que erros/logs **não** imprimem API key ou payloads completos.
- `docs/mailgun-production.md`: SPF, DKIM, DMARC (breve); readiness; se não houver rota de teste, documentar verificação via painel Mailgun.
- Rate limit em forgot-password (obrigatório).

---

## Fase 9 — Observabilidade e smoke

- Logging seguro (sem tokens completos, sem segredos).
- Checklist pós-deploy no doc de primeiro deploy (HTTPS, headers, login, dashboard, post, upload, favicon, reset, newsletter se activo).

---

## Fase 10 — Entregáveis finais

1. Correcções de código listadas nas fases.
2. `docs/security-audit.md` actualizado.
3. `docs/security-hardening.md` + deploy/backup/Mailgun.
4. Testes para password e validações críticas.
5. **Lista de riscos residuais** (ex. rate limit por processo, sem antivírus em ficheiros).
6. **Checklist de aceitação** alinhado ao prompt PART 12 (marcar cada item quando feito).

---

## Ordem de implementação recomendada

1. `security-audit.md` (rascunho → iterar).
2. Argon2id + tokens de reset hashed + migração.
3. Rate limits + upload + `media/raw` + `Media` lookup.
4. Headers + CSP fase 1 + docs.
5. Health + Docker + docs deploy/backup.
6. Inventário final de APIs + fecho de documentação e riscos residuais.

---

## O que não fazer (conforme prompt)

- Novas features de produto, redesign de UI, Kubernetes/Terraform, “checklist only” sem código, teatro de segurança sem controlo real.
