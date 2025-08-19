# Components Overview

## Header (`components/Header.tsx`)

- Fixed navbar with dynamic background:
  - Transparent only on Home hero while not scrolled; solid on scroll and on all other routes.
- Exports: default React component.

Usage:

```tsx
import Header from "@/components/Header";
```

## MainLayout (`components/MainLayout.tsx`)

- Wraps pages with `Header`, `Footer`, social buttons.
- Emits page-view to analytics on route change.

## RealTimeViewers (`components/RealTimeViewers.tsx`)

- Shows current number of online viewers for a `page` key.
- Props:
  - `page: string` (required)
  - `vehicleId?: string`
  - `variant?: 'fixed' | 'inline'` (default: `fixed`)

Example:

```tsx
<RealTimeViewers page={`vehicle-${id}`} variant="inline" />
```

## OptimizedImage (`components/OptimizedImage.tsx`)

- Lazy loads images, tries WebP then falls back; shows inline SVG placeholder.
- Props: `src`, `alt`, optional `className`, `width`, `height`, `sizes`, `priority`.

Example:

```tsx
<OptimizedImage src={url} alt="Car" className="w-full h-48 object-cover" />
```

## VehicleCard (`components/VehicleCard.tsx`)

- Card showing vehicle info with favorite support.
- Props: `vehicle`, optional `viewMode: 'grid' | 'list'`.

## VehicleCarousel (`components/VehicleCarousel.tsx`)

- Responsive carousel with touch support and autoplay on mobile.
- Props: `vehicles: Vehicle[]`.

## AdminDashboardPage (`pages/AdminDashboardPage.tsx`)

- Simplified dashboard with key KPIs and monthly views chart.
- Removed device/city/realtime charts to reduce load.
