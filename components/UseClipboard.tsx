import { useCallback } from "react";

export const useClipboard = () => {
  const copyToClipboard = useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("Text copied to clipboard");
        },
        (err) => {
          console.error("Failed to copy text: ", err);
        }
      );
    } else {
      console.error("Clipboard API not supported");
    }
  }, []);

  return { copyToClipboard };
};
