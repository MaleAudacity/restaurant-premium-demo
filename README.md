# restaurant-premium-demo

Premium multi-surface restaurant platform demo for **Mirch Masala**, built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Prisma, PostgreSQL, and demo auth.

## Included Surfaces

- Public website
- Admin dashboard
- Kitchen dashboard
- Demo chat simulator
- Demo control panel
- Seeded analytics, bookings, events, notifications, and restaurant settings

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn-style component setup
- Prisma + PostgreSQL
- Zod
- Lucide icons
- SSE-based realtime refresh layer for demo updates

## Project Structure

```text
restaurant-premium-demo
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── app
│   │   ├── (auth)/login
│   │   ├── (dashboard)
│   │   │   ├── analytics
│   │   │   ├── bookings
│   │   │   ├── dashboard
│   │   │   ├── demo/chat
│   │   │   ├── demo/control
│   │   │   ├── events
│   │   │   ├── kitchen
│   │   │   ├── orders
│   │   │   └── settings
│   │   ├── (public)
│   │   │   ├── about
│   │   │   ├── book-table
│   │   │   ├── cart
│   │   │   ├── checkout
│   │   │   ├── contact
│   │   │   ├── menu/[id]
│   │   │   ├── track-order
│   │   │   └── whatsapp-order
│   │   └── api/events
│   ├── components
│   │   ├── dashboard
│   │   ├── layout
│   │   └── ui
│   ├── lib
│   │   ├── demo
│   │   ├── realtime
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── server
│       ├── actions
│       └── queries
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## Local Setup

1. Copy env values.

```bash
cp .env.example .env
```

2. Install dependencies.

```bash
npm install
```

3. Start PostgreSQL locally.

```bash
docker compose up -d postgres
```

4. Generate Prisma client and push schema.

```bash
npm run db:generate
npm run db:push
```

5. Seed Mirch Masala demo data.

```bash
npm run db:seed
```

6. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000`

## Demo Login Roles

- Owner: `owner@mirchmasala.demo`
- Manager: `manager@mirchmasala.demo`
- Kitchen: `kitchen@mirchmasala.demo`

Use the `/login` screen to switch roles instantly.

## Database Notes

The Prisma schema includes:

- `Restaurant`
- `User`
- `Customer`
- `CustomerAddress`
- `MenuCategory`
- `MenuItem`
- `InventoryStatus`
- `Order`
- `OrderItem`
- `Payment`
- `TableBooking`
- `EventInquiry`
- `Conversation`
- `MessageLog`
- `Notification`
- `BusinessHour`
- `DeliveryZone`
- `AuditLog`

All restaurant-owned records are designed around `restaurantId` for future multi-restaurant support.

## Docker

To run the full stack with Docker:

```bash
docker compose up --build
```

Then apply schema and seed from inside the app container or locally against the mapped database:

```bash
npm run db:push
npm run db:seed
```

## Phase Coverage

- Step 1: scaffold + premium shells
- Step 2: Prisma schema
- Step 3: deterministic seed
- Step 4: dashboard pages bound to seeded data
- Step 5: public website pages bound to seeded data
- Step 6: demo chat/control actions with SSE-driven refresh

## Server Deployment

The repository includes a PM2 config and an Nginx vhost template for:

- `mirch.ai-workflows.cloud`

App process:

- PM2 app name: `restaurant-premium-demo`
- Internal port: `3002`

Files:

- `ecosystem.config.js`
- `deploy/nginx/mirch.ai-workflows.cloud.conf`
- `deploy/deploy-mirch.sh`

Typical server-side steps:

```bash
cd /home/anmol/projects/restaurant-premium-demo
bash deploy/deploy-mirch.sh
sudo cp deploy/nginx/mirch.ai-workflows.cloud.conf /etc/nginx/sites-available/mirch.ai-workflows.cloud
sudo ln -s /etc/nginx/sites-available/mirch.ai-workflows.cloud /etc/nginx/sites-enabled/mirch.ai-workflows.cloud
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d mirch.ai-workflows.cloud
```
