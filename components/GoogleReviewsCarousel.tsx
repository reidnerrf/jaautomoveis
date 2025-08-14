
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleReview } from '../types.ts';
import { FaStar, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleReviewsCarouselProps {
  reviews: GoogleReview[];
}

const GoogleReviewsCarousel: React.FC<GoogleReviewsCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextReview, 5000); // Change review every 5 seconds
    return () => clearInterval(slideInterval);
  }, [nextReview]);

  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  const currentReview = reviews[currentIndex];

  return (
    <div className="w-full max-w-3xl text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white p-8 rounded-lg shadow-lg flex flex-col items-center justify-center"
        >
          <FaGoogle className="absolute top-4 right-4 text-gray-300" size={24} />
          <img 
            src={currentReview.avatarUrl} 
            alt={currentReview.reviewerName} 
            className="w-24 h-24 rounded-full mb-4 border-4 border-yellow-400"
          />
          <div className="flex text-yellow-400 mb-4">
            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
          </div>
          <p className="text-gray-600 italic text-lg mb-6">"{currentReview.comment}"</p>
          <div className="text-center">
             <h4 className="font-bold text-gray-800 text-xl">{currentReview.reviewerName}</h4>
             <p className="text-sm text-gray-400 mt-1">{currentReview.timeAgo}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-center mt-6 space-x-2">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentIndex === index ? 'bg-main-red' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GoogleReviewsCarousel;
