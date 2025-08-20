import React, { Suspense } from "react";

interface LazyMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyMotionWrapper: React.FC<LazyMotionProps> = ({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded" />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export default LazyMotionWrapper;
