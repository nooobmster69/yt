import React from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export const CopyButton = ({ textToCopy, className }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    if (isCopied) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    });
  }, [textToCopy, isCopied]);

  const buttonClasses = className || "absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all duration-200 disabled:opacity-50";

  return (
    <button
      onClick={handleCopy}
      className={buttonClasses}
      aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
      disabled={isCopied}
    >
      {isCopied ? (
        <CheckIcon className="w-5 h-5 text-green-400" />
      ) : (
        <ClipboardIcon className="w-5 h-5 text-gray-300" />
      )}
    </button>
  );
};