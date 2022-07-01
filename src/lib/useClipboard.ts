import { useState } from 'react';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const onCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return [onCopy, copied];
};
