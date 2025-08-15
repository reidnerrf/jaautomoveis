import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface GoogleReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviewsPageUrl: string;
}

const GoogleReviewSummary: React.FC<GoogleReviewSummaryProps> = ({
  rating,
  reviewCount,
  reviewsPageUrl
}) => {
  const renderStars = () => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} />);
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-2xl p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm mx-auto"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
        <FcGoogle size={26} />
        Avaliações do Google
      </h3>

      <div className="flex flex-col items-center gap-1 mb-3">
        <span className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</span>
        <div className="flex text-yellow-400 text-lg">{renderStars()}</div>
      </div>

      <a
        href={reviewsPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-300"
      >
        Ver as {reviewCount} avaliações
      </a>
    </motion.div>
  );
};

export default GoogleReviewSummary;
