import React from 'react';
import { CopyButton } from './CopyButton';
import { CloseIcon } from './icons';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: {
    systemInstruction: string;
    userPrompt: string;
  } | null;
}

export const PromptModal = ({ isOpen, onClose, prompt }: PromptModalProps) => {
  if (!isOpen) return null;
  
  const fullPromptText = prompt 
    ? `System Instruction:\n\n${prompt.systemInstruction}\n\n---\n\nUser Prompt:\n\n${prompt.userPrompt}`
    : '';

  return (
    <div 
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="prompt-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Full Gemini API Prompt</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto relative">
          {prompt ? (
            <React.Fragment>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-2">System Instruction</h3>
              <pre className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed bg-gray-100 dark:bg-black/30 p-3 rounded-md mb-6">
                  {prompt.systemInstruction}
              </pre>
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-300 mb-2">User Prompt</h3>
              <pre className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed bg-gray-100 dark:bg-black/30 p-3 rounded-md">
                  {prompt.userPrompt}
              </pre>
              <CopyButton textToCopy={fullPromptText} />
            </React.Fragment>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">The prompt is now generated in multiple steps for real-time streaming. A unified view is not available.</p>
          )}
        </main>
      </div>
    </div>
  );
};