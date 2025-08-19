# API Reference

All endpoints are prefixed with `/api`.

## Auth

- POST `/api/auth/login`
  - body: `{ username: string, password: string }`
  - 200: `{ _id, username, token }`
  - 401 on invalid credentials

- POST `/api/auth/session/open`
  - headers: `Authorization: Bearer <token>`
  - 200: `{ sessionId }` (no-op; múltiplas sessões permitidas)

- POST `/api/auth/session/close`
  - headers: `Authorization: Bearer <token>`
  - 200: `{ message }` (no-op; múltiplas sessões permitidas)

- POST `/api/auth/forgot-password`
  - body: `{ email: string }`
  - 200: `{ message: 'Reset email sent' }` (link é logado no servidor em dev)

- POST `/api/auth/reset-password`
  - body: `{ token: string, password: string }`
  - 200: `{ message: 'Senha redefinida com sucesso' }`

## Vehicles

- GET `/api/vehicles`
  - 200: `Vehicle[]`

- GET `/api/vehicles/:id`
  - 200: `Vehicle`

- POST `/api/vehicles` (Admin)
  - headers: `Authorization: Bearer <token>`
  - body: `Omit<Vehicle,'id'>`

- PUT `/api/vehicles/:id` (Admin)
  - headers: `Authorization: Bearer <token>`
  - body: `Vehicle`

- DELETE `/api/vehicles/:id` (Admin)
  - headers: `Authorization: Bearer <token>`

- POST `/api/vehicles/:id/view`
  - body: none; increments view counter

- GET `/api/vehicles/most-viewed?limit=10&periodDays=30`
  - 200: `Vehicle[]`

## Uploads (Admin)

- POST `/api/upload`
  - headers: `Authorization: Bearer <token>`
  - form: `images[]` + optional `vehicleName`
  - 201: `string[]` (paths ex.: `/uploads/1-vehicle-...webp`)

## Analytics (Admin)

- GET `/api/analytics/monthly-views`
  - headers: `Authorization: Bearer <token>`
  - 200: `[{ month: string, "Visualizações": number }]`

- GET `/api/analytics/dashboard-stats`
  - headers: `Authorization: Bearer <token>`
  - 200: `{ totalViews, todayViews, whatsappClicks, instagramClicks, likedVehicles, totalLikes, ... }`

Socket.IO:
- Client connects at path `/socket.io`
- Events:
  - `page-view` -> `{ page }` (emitted pelo front)
  - `page-viewers` (server -> clients) `{ page, count }`
  - `user-action` -> `{ action, category, label, page }`

## Types

```ts
interface Vehicle {
  id: string;
  name: string;
  price: number;
  make: string;
  model: string;
  year: number;
  km: number;
  color: string;
  gearbox: 'Manual' | 'Automático';
  fuel: 'Gasolina' | 'Etanol' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido';
  doors: number;
  additionalInfo: string;
  optionals: string[];
  images: string[];
  views: number;
  createdAt?: string;
}
```

## Examples

- Login from the browser:
```ts
const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: '***' }) });
const data = await res.json();
```

- Upload images with token:
```ts
const fd = new FormData();
files.forEach(f => fd.append('images', f));
await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
```