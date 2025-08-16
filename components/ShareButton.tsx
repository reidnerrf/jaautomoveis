
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi';
import { Vehicle } from '../types';

interface ShareButtonProps {
  vehicle: Vehicle;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ vehicle, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = window.location.href;
  const title = `Confira este ${vehicle.name} na JA Automóveis!`;
  // removed unused description variable

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiShare2 size={20} />
        Compartilhar
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Share menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 min-w-[280px] z-50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compartilhar veículo
              </h3>
              
              <div className="flex gap-3 mb-4">
                <FacebookShareButton url={shareUrl} quote={title}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <FacebookIcon size={40} round />
                  </motion.div>
                </FacebookShareButton>
                
                <TwitterShareButton url={shareUrl} title={title}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <TwitterIcon size={40} round />
                  </motion.div>
                </TwitterShareButton>
                
                <WhatsappShareButton url={shareUrl} title={title}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <WhatsappIcon size={40} round />
                  </motion.div>
                </WhatsappShareButton>
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
              >
                {copied ? (
                  <FiCheck className="text-green-500" size={18} />
                ) : (
                  <FiCopy className="text-gray-600 dark:text-gray-300" size={18} />
                )}
                <span className="text-gray-900 dark:text-white font-medium">
                  {copied ? 'Link copiado!' : 'Copiar link'}
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
