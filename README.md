# OptEventos

Plataforma web de reservas de hotel para eventos, construída para ligar três perfis de utilizador num único fluxo:

- Cliente: escolhe evento, hotel e regime, cria reserva e efetua pagamento.
- Hotel: acompanha reservas associadas ao seu hotel e gere equipa interna do hotel.
- Admin: opera catálogo, pagamentos, relatórios, utilizadores e controlo global do negócio.

O projeto segue arquitetura Laravel + Inertia + React, com foco em produtividade de desenvolvimento, UX moderna e base sólida para evolução em produção.

## Principais objetivos do produto

- Centralizar reservas de alojamento orientadas a eventos.
- Reduzir fricção do checkout para o cliente.
- Dar visibilidade operacional a hotéis e admins em tempo real.
- Integrar pagamentos com Stripe e ciclo de notificações completo.
- Permitir escala funcional sem separar API e frontend em aplicações distintas.

## Stack tecnológica

- Backend: Laravel 12 (PHP 8.2+)
- Frontend: Inertia.js + React + TypeScript
- UI: Tailwind CSS
- Bundler: Vite
- Base de dados:
  - Desenvolvimento: SQLite
  - Produção: MySQL ou PostgreSQL
- Pagamentos: Stripe (Payment Intents + Webhooks)
- Notificações:
  - In-app (database notifications)
  - Email (Laravel Notifications)
  - Browser Push (Web Push API + Service Worker)

## Funcionalidades implementadas

### Website público

- Landing page com proposta de valor, conteúdo comercial e acesso rápido ao checkout.
- Bloco de seleção de disponibilidade diretamente na página inicial.
- Galeria de imagens de hotel com melhor experiência visual.
- Header e footer públicos reutilizáveis.
- Secções públicas extraídas para componentes em `resources/js/Components/Publico` para facilitar manutenção e estilização.
- Páginas legais públicas: privacidade, cookies e termos.
- Banner de cookies com gestão de consentimento.

### Checkout e reservas (cliente)

- Fluxo guiado por etapas:
  - Selecionar evento
  - Selecionar hotel do evento
  - Selecionar regime
  - Selecionar datas e número de hóspedes
- Validações de janela de reserva, disponibilidade e capacidade de quarto.
- Criação de Payment Intent antes da confirmação da reserva.
- Criação de booking e pagamento associado.
- Página de pagamento da reserva com sincronização de estado.
- Suporte a políticas de tarifa:
  - cancelamento gratuito
  - tarifa não reembolsável
  - sinal não reembolsável
- Suporte a pagamento por prestações:
  - sinal com valor fixo
  - restante liquidado antes do check-in (dias configuráveis).

### Área do cliente

- Dashboard com resumo e acesso rápido.
- Lista e detalhe de reservas.
- Cancelamento de reservas (com regras de elegibilidade).
- Eliminação de reservas canceladas ou expiradas (fluxo de limpeza de histórico).
- Página dedicada de `Faturas` com downloads num único local.

### Área admin

- Dashboard administrativo.
- Gestão de utilizadores e roles (`ADMIN`, `CLIENT`, `HOTEL`).
- Gestão de eventos.
- Gestão de hotéis e galeria de imagens.
- Gestão de tarifas (room type, meal plan, preço, stock, ativação).
- Gestão de bookings e respetivos estados.
- Gestão de pagamentos de cliente e pagamentos a fornecedor.
- Relatórios com exportação para CSV.

### Área hotel

- Acesso apenas às reservas do hotel associado.
- Gestão de equipa do hotel (criar/editar/remover utilizadores `HOTEL` do mesmo hotel).
- Restrição de acesso por contexto para evitar fuga de dados entre hotéis.

### Notificações e comunicação

- Notificações in-app para cliente, admin e hotel.
- Emails automáticos para eventos chave:
  - Reserva criada
  - Pagamento confirmado
  - Reserva cancelada
  - Emissão de documentos de faturação (fatura)
  - Alertas administrativos de reserva paga
- Push web para perfis elegíveis (admin/hotel), com gestão de subscrições por browser.

## Fluxo de negócio (resumo)

1. Cliente escolhe evento e oferta de hotel.
2. Sistema valida disponibilidade e cria intent de pagamento.
3. Cliente conclui checkout.
4. Booking é criado com registos financeiros associados:
   - `payments` (cliente)
   - `supplier_payments` (fornecedor/hotel)
5. Notificações são emitidas para os atores relevantes.
6. Webhook Stripe atualiza estado de pagamento (`PAID`, etc.).
7. Em pagamentos confirmados, o sistema emite `INVOICE` e envia email ao cliente.

## Perfis e permissões

- `ADMIN`
  - Gestão total de catálogo, utilizadores, reservas, pagamentos e relatórios.
- `HOTEL`
  - Visibilidade limitada ao próprio hotel.
  - Gestão da equipa do hotel.
- `CLIENT`
  - Gestão das próprias reservas e pagamentos.

## Estrutura de rotas (alto nível)

### Públicas

- `GET /`
- `POST /webhooks/stripe`
- `POST /webhooks/payments`

### Cliente autenticado

- `GET /checkout`
- `POST /checkout/payment-intent`
- `POST /checkout`
- `GET /dashboard`
- `GET /dashboard/bookings`
- `GET /dashboard/bookings/{booking}`
- `GET /dashboard/bookings/{booking}/payment`
- `GET /dashboard/faturas-recibos`
- `GET /dashboard/bookings/{booking}/billing/{invoice}`
- `POST /dashboard/bookings/{booking}/payment/intent`
- `POST /dashboard/bookings/{booking}/payment/sync-stripe`
- `POST /dashboard/bookings/{booking}/payment/confirm`
- `POST /dashboard/bookings/{booking}/cancel`
- `DELETE /dashboard/bookings/{booking}`

### Hotel autenticado

- `GET /hotel/bookings`
- `GET /hotel/users`
- `POST /hotel/users`
- `PATCH /hotel/users/{user}`
- `DELETE /hotel/users/{user}`

### Admin autenticado

- `/admin`
- `/admin/users`
- `/admin/events`
- `/admin/hotels`
- `/admin/rates`
- `/admin/bookings`
- `/admin/payments`
- `/admin/supplier-payments`
- `/admin/reports`

## Instalação local

### Requisitos

- PHP 8.2+
- Composer 2+
- Node.js 20+ e npm
- Extensões PHP recomendadas: `pdo`, `mbstring`, `openssl`, `json`, `fileinfo`, `bcmath`, `gmp`

### Setup inicial

```bash
cd app
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan optimize:clear
```

### Executar em desenvolvimento

Terminal 1:

```bash
cd app
php artisan serve
```

Terminal 2:

```bash
cd app
npm run dev
```

Aplicação: `http://127.0.0.1:8000`

## Credenciais seed (local)

- Admin
  - Email: `admin@opteventos.test`
  - Password: `password`
- Cliente
  - Email: `client@opteventos.test`
  - Password: `password`

## Configuração de pagamentos (Stripe)

Adicionar no `.env`:

```env
PAYMENT_PROVIDER=STRIPE
STRIPE_SECRET_KEY=sk_test_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Escutar webhooks localmente:

```bash
stripe listen --forward-to http://127.0.0.1:8000/webhooks/stripe
```

### Métodos de pagamento Stripe (opcional)

Podes limitar os métodos apresentados no checkout:

```env
STRIPE_PAYMENT_METHOD_TYPES=card,multibanco,paypal,klarna,mbway,revolut_pay
```

Nota:

- Usa apenas métodos suportados pela tua conta/país no Stripe.
- Depois de alterar, executa `php artisan optimize:clear`.

## Configuração de faturação (Portugal)

Adicionar no `.env`:

```env
BILLING_SERIES_INVOICE=FS
BILLING_SERIES_RECEIPT=RC
BILLING_SERIES_VALIDATION_CODE_INVOICE=
BILLING_SERIES_VALIDATION_CODE_RECEIPT=
BILLING_DOCUMENT_PLACE=Lisboa
BILLING_PAYMENT_TERMS=Pronto pagamento
BILLING_VAT_RATE_PERCENT=6
BILLING_VAT_EXEMPTION_REASON=
BILLING_ATCUD=
BILLING_DOCUMENT_NOTES=Documento emitido por via eletrónica
```

Notas importantes:

- O sistema usa atualmente emissão de **fatura** (`INVOICE`) no fluxo principal.
- Para ATCUD não pendente, tens de comunicar séries no Portal das Finanças e preencher os campos `BILLING_SERIES_VALIDATION_CODE_*`.
- Se os códigos de validação estiverem vazios, o ATCUD aparece como `PENDENTE-xxxxxx`.

## Configuração de email (SMTP real)

Exemplo Gmail:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=teu_email@gmail.com
MAIL_PASSWORD="app_password"
MAIL_FROM_ADDRESS=teu_email@gmail.com
MAIL_FROM_NAME="OptEventos"
```

Aplicar alterações:

```bash
cd app
php artisan optimize:clear
```

Importante:

- O utilizador admin precisa de email real na tabela `users` para receber notificações por email.
- Em produção, evitar emails de teste/fake para contas operacionais.

## Configuração de push web

### 1) Gerar chaves VAPID

```bash
cd app
php artisan webpush:vapid
```

### 2) Guardar no `.env`

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:teu_email@dominio.com
```

### 3) Migrar base de dados

```bash
cd app
php artisan migrate
```

### 4) Verificar HTTPS

Push real exige contexto seguro:

- `https://...` em produção
- exceção local `http://localhost` / `http://127.0.0.1`

## Testes e qualidade

Executar backend tests:

```bash
cd app
php artisan test
```

Validar build frontend:

```bash
cd app
npm run build
```

## Operações úteis

Reset completo da base:

```bash
cd app
php artisan migrate:fresh --seed --force
```

Limpar cache/config:

```bash
cd app
php artisan optimize:clear
```

## Deploy em produção (guia curto)

Não basta copiar `public/build`.  
Para Laravel funcionar corretamente, é necessário publicar o projeto completo.

### Passos recomendados

```bash
cd app
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

### Checklist mínima de produção

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://teu-dominio`
- `DB_CONNECTION` e credenciais corretas
- SMTP funcional
- Stripe live/test conforme ambiente
- Webhook Stripe apontado para domínio correto
- HTTPS ativo (obrigatório para push real)

## Estrutura frontend (resumo)

- `resources/js/Pages`
  - Páginas Inertia (públicas, cliente, admin, hotel, legal).
- `resources/js/Components`
  - Componentes globais e layout.
- `resources/js/Components/Publico`
  - Secções reutilizáveis das páginas públicas:
    - `WelcomeSections.tsx`
    - `EventosSections.tsx`
    - `ContactosSections.tsx`

Esta organização permite evoluir visual da área pública sem tocar na lógica principal de cada página.

## Segurança e boas práticas

- Nunca versionar `.env` com segredos.
- Rotacionar chaves/senhas sempre que expostas.
- Remover scripts temporários de manutenção em produção (`artisan-run.php`, `db-test.php`) após uso.
- Garantir permissões de ficheiros corretas em `storage/` e `bootstrap/cache/`.
- Usar contas distintas por role e princípio de menor privilégio.

## Troubleshooting

### Imagens de hotel não aparecem

- Confirmar ficheiros em `storage/app/public/hotels` e `storage/app/public/events`
- Confirmar rota pública de media (`/media/{path}`) operacional
- Se o ambiente depender de symlink, verificar `php artisan storage:link`
- Limpar cache (`php artisan optimize:clear`)

### Favicon não aparece no servidor

- Confirmar ficheiro `public/favicon.ico` existente.
- Confirmar `<link rel="icon"...>` no `resources/views/app.blade.php`.
- Se a app correr em subpasta `/public`, validar URL final `https://dominio/public/favicon.ico`.
- Limpar caches (`php artisan optimize:clear`) e forçar refresh do browser (`Ctrl+F5`).

### Página branca em túnel (ngrok/cloudflare)

- Normalmente é mixed content/CORS com assets de dev (`:5173`)
- Em partilha externa usar build de produção (`npm run build`)
- Confirmar `APP_URL=https://...`

### Stripe confirma no dashboard mas app não atualiza

- Confirmar webhook ativo e endpoint correto
- Confirmar `STRIPE_WEBHOOK_SECRET`
- Verificar `storage/logs/laravel.log`

### Erro 419 em mobile/iOS

- Confirmar domínio/protocolo consistentes (http vs https)
- Confirmar sessão/cookies (`APP_URL`, same-site, proxy)
- Limpar cache da aplicação

## Roadmap sugerido

- Backoffice com métricas avançadas e dashboards financeiros.
- Hardening de segurança (2FA, rate-limiting avançado, auditoria reforçada).
- Modo multi-tenant para múltiplos operadores.
- Integrações de faturação e ERP.
- Testes E2E para fluxos críticos (checkout, pagamento, notificações).

## Licença

Projeto privado. Definir licença comercial antes de distribuição pública.
