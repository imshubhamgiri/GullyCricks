import { useState } from "react";

export const useCopyToClipboard = (duration: number = 2000) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return { copied, handleCopy };
};
