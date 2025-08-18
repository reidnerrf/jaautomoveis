import React, { Suspense, lazy } from 'react';

// Lazy load components that are not critical for initial render
export const LazyVehicleCarousel = lazy(() => import('./VehicleCarousel'));
export const LazyPriceComparison = lazy(() => import('./PriceComparison'));
export const LazyGoogleReviewsCarousel = lazy(() => import('./GoogleReviewsCarousel'));
export const LazyGoogleReviewSummary = lazy(() => import('./GoogleReviewSummary'));
export const LazyShareButton = lazy(() => import('./ShareButton'));
export const LazyRealTimeViewers = lazy(() => import('./RealTimeViewers'));

// Admin components
export const LazyAdminDashboard = lazy(() => import('../pages/AdminDashboardPage'));
export const LazyAdminVehicleList = lazy(() => import('../pages/AdminVehicleListPage'));
export const LazyAdminVehicleForm = lazy(() => import('../pages/AdminVehicleFormPage'));

// Page components
export const LazyInventoryPage = lazy(() => import('../pages/InventoryPage'));
export const LazyVehicleDetailPage = lazy(() => import('../pages/VehicleDetailPage'));
export const LazyAboutPage = lazy(() => import('../pages/AboutPage'));
export const LazyContactPage = lazy(() => import('../pages/ContactPage'));
export const LazyFinancingPage = lazy(() => import('../pages/FinancingPage'));
export const LazyConsortiumPage = lazy(() => import('../pages/ConsortiumPage'));

// Loading components
const VehicleCarouselSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="flex space-x-2">
      {[...Array(4)].map((_, i) => (
        <div key={`carousel-skeleton-${i}`} className="w-24 h-16 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const PriceComparisonSkeleton = () => (
  <div className="animate-pulse bg-gray-50 p-6 rounded-2xl">
    <div className="h-6 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={`price-skeleton-${i}`} className="h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const ReviewsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="flex space-x-4">
      {[...Array(3)].map((_, i) => (
        <div key={`review-skeleton-${i}`} className="flex-1 bg-gray-50 p-4 rounded">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={`page-skeleton-${i}`} className="bg-white rounded-lg shadow p-4">
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

// HOC for lazy components with loading states
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = () => <div className="animate-pulse bg-gray-200 rounded h-32"></div>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <Component {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Pre-configured lazy components with appropriate loading states
export const LazyVehicleCarouselWithLoading = withLazyLoading(LazyVehicleCarousel, VehicleCarouselSkeleton);
export const LazyPriceComparisonWithLoading = withLazyLoading(LazyPriceComparison, PriceComparisonSkeleton);
export const LazyGoogleReviewsWithLoading = withLazyLoading(LazyGoogleReviewsCarousel, ReviewsSkeleton);
export const LazyInventoryPageWithLoading = withLazyLoading(LazyInventoryPage, PageSkeleton);
export const LazyVehicleDetailPageWithLoading = withLazyLoading(LazyVehicleDetailPage, PageSkeleton);