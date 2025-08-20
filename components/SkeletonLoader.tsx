import React from "react";

interface SkeletonLoaderProps {
  type?: "card" | "list" | "detail" | "text";
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "card",
  count = 1,
  className = "",
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`bg-white rounded-lg shadow-md p-4 animate-pulse ${className}`}>
            <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        );

      case "list":
        return (
          <div className={`bg-white rounded-lg shadow-md p-4 animate-pulse ${className}`}>
            <div className="flex space-x-4">
              <div className="bg-gray-300 h-20 w-20 rounded-md"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );

      case "detail":
        return (
          <div className={`bg-white rounded-lg shadow-md p-6 animate-pulse ${className}`}>
            <div className="bg-gray-300 h-64 rounded-md mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};
