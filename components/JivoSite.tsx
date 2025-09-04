import { useEffect } from "react";

declare global {
  interface Window {
    jivo_api?: any;
  }
}

const JivoSite = () => {
  useEffect(() => {
    // Check if script is already loaded
    if (window.jivo_api) {
      return;
    }

    // Create and load the script dynamically
    const script = document.createElement("script");
    script.src = "//code.jivosite.com/widget/zbKIoNfzd8";
    script.async = true;
    script.onload = () => {
      console.log("JivoSite script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load JivoSite script");
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove script if component unmounts (optional)
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default JivoSite;
