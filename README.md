# OptEventos

Plataforma de reservas de hotel para eventos, com foco em fluxo simples para cliente e gestão operacional completa para equipa/admin.

## Stack Tecnológica

- Backend: Laravel 12 (PHP 8.2+)
- Frontend: Inertia.js + React + TypeScript
- UI: Tailwind CSS
- Build: Vite
- Pagamentos: Stripe (modo teste e webhook)
- Notificações: In-app (DB) + Email (Laravel Notifications)
- Base de dados:
- Local (por defeito neste projeto): SQLite
- Produção recomendada: PostgreSQL

## O que o projeto já inclui

- Landing page (`/`) com seletor de disponibilidade e visual de hotel.
- Checkout (`/checkout`) com seleção por passos:
- Evento
- Hotel desse evento
- Regime/refeição
- Datas e hóspedes
- Preparação de intenção de pagamento antes de criar booking.
- Área de cliente:
- Lista de reservas
- Detalhe da reserva
- Pagamento da reserva
- Cancelamento e eliminação (regras de elegibilidade)
- Área admin:
- Dashboard
- Gestão de utilizadores (roles)
- Gestão de eventos, hotéis e tarifas
- Gestão de bookings, pagamentos e supplier payments
- Relatórios + export CSV
- Upload de imagens de hotéis (galeria), com preview e consumo no frontend.
- Sistema de notificações:
- Booking criado
- Pagamento confirmado
- Booking cancelado
- Alerta para admin em confirmação de booking pago

## Estrutura de módulos (rotas principais)

- Público:
- `GET /`
- `POST /webhooks/payments`
- `POST /webhooks/stripe`
- Cliente autenticado:
- `GET /checkout`
- `POST /checkout/payment-intent`
- `POST /checkout`
- `GET /dashboard`
- `GET /dashboard/bookings`
- `GET /dashboard/bookings/{booking}`
- `GET /dashboard/bookings/{booking}/payment`
- `POST /dashboard/bookings/{booking}/payment/intent`
- `POST /dashboard/bookings/{booking}/payment/sync-stripe`
- `POST /dashboard/bookings/{booking}/payment/confirm`
- `POST /dashboard/bookings/{booking}/cancel`
- `DELETE /dashboard/bookings/{booking}`
- `POST /notifications/{notification}/read`
- `POST /notifications/read-all`
- Admin:
- `/admin`
- `/admin/users`
- `/admin/events`
- `/admin/hotels`
- `/admin/rates`
- `/admin/bookings`
- `/admin/payments`
- `/admin/supplier-payments`
- `/admin/reports`

## Setup Local

```bash
cd app
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
```

## Arranque em desenvolvimento

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

Abrir: `http://127.0.0.1:8000`

## Credenciais seed (ambiente local)

- Admin:
- Email: `admin@opteventos.test`
- Password: `password`
- Cliente teste:
- Email: `client@opteventos.test`
- Password: `password`

## Configuração de Pagamentos (Stripe)

No `.env`:

```env
PAYMENT_PROVIDER=STRIPE
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook local:

```bash
stripe listen --forward-to http://127.0.0.1:8000/webhooks/stripe
```

## Configuração de Email

Exemplo com Gmail SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SCHEME=smtp
MAIL_USERNAME=teu_email@gmail.com
MAIL_PASSWORD="app_password_gmail"
MAIL_FROM_ADDRESS=teu_email@gmail.com
MAIL_FROM_NAME="OptEventos"
```

Depois de alterar `.env`:

```bash
cd app
php artisan optimize:clear
```

## Testes e validação

```bash
cd app
php artisan test
npm run build
```

## Reset da base de dados

Com seed:

```bash
cd app
php artisan migrate:fresh --seed --force
```

Sem seed:

```bash
cd app
php artisan migrate:fresh --force
```

## Deploy (resumo)

Não basta publicar `public/build`.  
Em Laravel, é necessário publicar o projeto completo e apontar o web server para `app/public`.

Passos base de produção:

```bash
cd app
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Checklist de produção:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://teu-dominio`
- `TRUSTED_PROXIES=*` (se estiver atrás de proxy/túnel/load balancer)
- DB e SMTP configurados
- Chaves Stripe de produção (quando aplicável)

## Troubleshooting rápido

- Imagens de hotel não aparecem:
- Confirma `php artisan storage:link`
- Confirma ficheiros em `storage/app/public/hotels`
- Limpa cache: `php artisan optimize:clear`
- Página branca/erros no túnel ngrok:
- Normalmente é mixed content (`http` dentro de `https`)
- Verifica `APP_URL=https://...` e `TRUSTED_PROXIES=*`
- Stripe atualiza no dashboard mas não no projeto:
- Confirmar CLI webhook ativo (`stripe listen`)
- Confirmar `STRIPE_WEBHOOK_SECRET` no `.env`

## Nota de arquitetura

O projeto foi pensado para escalar com separação clara:

- Domínio de reservas (bookings/rates/events/hotels)
- Domínio financeiro (payments/supplier_payments)
- Domínio operacional (admin/reporting/notificações)

Base sólida para evolução para multi-tenant, integrações externas e automações de backoffice.
