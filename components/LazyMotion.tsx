import React, { Suspense, lazy } from "react";

// Lazy load framer-motion components
const LazyMotion = lazy(() =>
  import("framer-motion").then((module) => ({
    default: module.motion,
  })),
);

interface LazyMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyMotionWrapper: React.FC<LazyMotionProps> = ({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded" />,
}) => {
  return (
    <Suspense fallback={fallback}>
      <LazyMotion>{children}</LazyMotion>
    </Suspense>
  );
};

export default LazyMotionWrapper;
