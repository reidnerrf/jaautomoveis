import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { Vehicle } from "../types";
import toast from "react-hot-toast";

interface ShareButtonProps {
  vehicle: Vehicle;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ vehicle, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const title = `Confira este ${vehicle.name} na JA Automóveis!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar o link para o clipboard.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        toast.error("Erro ao compartilhar.");
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleNativeShare}
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Compartilhar"
      >
        <FiShare2 size={18} />
        <span>Compartilhar</span>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <>
            {/* Fundo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu de compartilhamento */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 z-50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Compartilhar veículo
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-5 justify-items-center">
                <FacebookShareButton url={shareUrl} {...{ quote: title }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <FacebookIcon size={48} round />
                  </motion.div>
                </FacebookShareButton>

                <TwitterShareButton url={shareUrl} title={title}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <TwitterIcon size={48} round />
                  </motion.div>
                </TwitterShareButton>

                <WhatsappShareButton url={shareUrl} title={title}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <WhatsappIcon size={48} round />
                  </motion.div>
                </WhatsappShareButton>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
              >
                {copied ? (
                  <FiCheck className="text-green-500" size={18} />
                ) : (
                  <FiCopy className="text-gray-600 dark:text-gray-300" size={18} />
                )}
                <span className="text-gray-900 dark:text-white font-medium">
                  {copied ? "Link copiado!" : "Copiar link"}
                </span>
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
