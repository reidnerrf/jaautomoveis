import React from 'react';
import { FaStar } from 'react-icons/fa';

interface GoogleReviewSummaryProps {
  // API nova
  averageRating?: number;
  totalReviews?: number;
  // API antiga (compatibilidade)
  rating?: number;
  reviewCount?: number;
  reviewsPageUrl?: string;
}

const GoogleReviewSummary: React.FC<GoogleReviewSummaryProps> = (props) => {
  const averageRating = props.averageRating ?? props.rating ?? 0;
  const totalReviews = props.totalReviews ?? props.reviewCount ?? 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between gap-4 max-w-xl mx-auto">
      <div className="flex items-center gap-4">
        <FaStar size={28} className="text-yellow-400" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold text-gray-900" aria-label={`Nota média ${averageRating} de 5`}>
            {averageRating.toFixed(1)} / 5
          </p>
          <p className="text-sm text-gray-600" aria-label={`${totalReviews} avaliações`}>
            {totalReviews} avaliações
          </p>
        </div>
      </div>
      {props.reviewsPageUrl && (
        <a
          href={props.reviewsPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-300"
          aria-label="Ver avaliações no Google"
        >
          Ver avaliações
        </a>
      )}
    </div>
  );
};

export default GoogleReviewSummary;
