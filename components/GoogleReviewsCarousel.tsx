import React, { useState, useEffect, useCallback } from "react";
import { GoogleReview } from "../types.ts";
import { FaStar, FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface GoogleReviewsCarouselProps {
  reviews: GoogleReview[];
}

const GoogleReviewsCarousel: React.FC<GoogleReviewsCarouselProps> = ({
  reviews,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextReview, 6000);
    return () => clearInterval(slideInterval);
  }, [nextReview]);

  if (!reviews || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={
            currentReview.id || `${currentReview.reviewerName}-${currentIndex}`
          }
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center"
        >
          {/* Logo Google */}
          <div className="absolute top-4 right-4 text-gray-300">
            <FaGoogle size={26} />
          </div>

          {/* Avatar with robust fallback */}
          <motion.img
            src={currentReview.avatarUrl || "./assets/semavatar.png"}
            alt={currentReview.reviewerName}
            className="w-24 h-24 rounded-full mb-4 border-4 border-yellow-400 shadow-md object-cover bg-gray-100"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes("./assets/semavatar.png")) {
                target.src = "./assets/semavatar.png";
              }
            }}
          />

          {/* Estrelas */}
          <div className="flex text-yellow-400 mb-4">
            {["s1", "s2", "s3", "s4", "s5"].map((key, idx) => (
              <motion.div
                key={`star-${key}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <FaStar />
              </motion.div>
            ))}
          </div>

          {/* Comentário */}
          <p className="text-gray-700 italic text-lg mb-6 leading-relaxed">
            &ldquo;{currentReview.comment}&rdquo;
          </p>

          {/* Nome e tempo */}
          <div>
            <h4 className="font-semibold text-gray-900 text-xl">
              {currentReview.reviewerName}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {currentReview.timeAgo}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores */}
      <div className="flex justify-center mt-6 space-x-2">
        {reviews.map((review, index) => (
          <motion.button
            key={`indicator-${review.id || review.reviewerName}`}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              currentIndex === index
                ? "bg-red-500 scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Ir para avaliação ${index + 1}`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default GoogleReviewsCarousel;
