
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface GoogleReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviewsPageUrl: string;
}

const GoogleReviewSummary: React.FC<GoogleReviewSummaryProps> = ({ rating, reviewCount, reviewsPageUrl }) => {
  const renderStars = () => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) { stars.push(<FaStar key={`full-${i}`} />); }
    if (hasHalfStar) { stars.push(<FaStarHalfAlt key="half" />); }
    for (let i = 0; i < emptyStars; i++) { stars.push(<FaRegStar key={`empty-${i}`} />); }
    return stars;
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Avaliações do Google</h3>
      <div className="flex items-center justify-center space-x-2">
        <FcGoogle size={28} />
        <span className="text-lg font-bold text-gray-700">{rating.toFixed(1)}</span>
        <div className="flex items-center text-lg text-yellow-500">{renderStars()}</div>
      </div>
      <a
        href={reviewsPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 hover:underline mt-1 inline-block"
      >
        Ver as {reviewCount} avaliações
      </a>
    </div>
  );
};

export default GoogleReviewSummary;
