import * as React from 'react';
import { CloseIcon, BookOpenIcon } from './icons';
import { Loader } from './Loader';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseMarkdownToHtml = (markdown: string): string => {
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        if (line.startsWith('# ')) {
            // Skip the main title
        } else if (line.startsWith('## ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">${line.substring(4)}</h3>`;
        } else if (line.startsWith('- ')) {
            if (!inList) { html += '<ul class="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">'; inList = true; }
            let liContent = line.substring(2);
            liContent = liContent.replace(/\*\*(.*?):\*\*/g, '<span class="font-semibold text-gray-700 dark:text-gray-300">$1:</span>');
            liContent = liContent.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 text-sm font-mono bg-gray-200 dark:bg-gray-700 rounded-md">$1</code>');
            html += `<li>${liContent}</li>`;
        } else if (line.trim() !== '') {
            if (inList) { html += '</ul>'; inList = false; }
            let pContent = line;
            pContent = pContent.replace(/\*\*(.*?):\*\*/g, '<span class="font-semibold text-gray-700 dark:text-gray-300">$1:</span>');
            pContent = pContent.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 text-sm font-mono bg-gray-200 dark:bg-gray-700 rounded-md">$1</code>');
            html += `<p class="text-gray-600 dark:text-gray-400 my-2">${pContent}</p>`;
        }
    }
    if (inList) { html += '</ul>'; }
    return html;
};


export const UserGuideModal = ({ isOpen, onClose }: UserGuideModalProps) => {
  const [content, setContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/USER_GUIDE.md')
        .then(res => {
            if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
            return res.text();
        })
        .then(text => {
            setContent(parseMarkdownToHtml(text));
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Failed to load user guide:", err);
            setContent('<p class="text-red-500">Could not load user guide. Please check the console for details.</p>');
            setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-guide-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-7 h-7 text-purple-500"/>
            <h2 id="user-guide-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">User Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
            {isLoading 
                ? <Loader message="Loading guide..." /> 
                : <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            }
        </main>
      </div>
    </div>
  );
};