import React from 'react';
import { ClipboardIcon, CheckIcon } from './icons';
import type { GeneratedContent } from '../types';

interface TagsDisplayProps {
  tags: string;
  isEditMode?: boolean;
  onContentUpdate?: (field: 'tags', value: string) => void;
}

export const TagsDisplay = ({ tags, isEditMode = false, onContentUpdate }: TagsDisplayProps) => {
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null);
  const [allCopied, setAllCopied] = React.useState(false);

  const handleCopy = React.useCallback((textToCopy: string, isAll: boolean = false) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (isAll) {
        setAllCopied(true);
        setTimeout(() => setAllCopied(false), 2000);
      } else {
        setCopiedTag(textToCopy);
        setTimeout(() => setCopiedTag(null), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    });
  }, []);

  if (isEditMode) {
      return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit YouTube Tags</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Edit the comma-separated list of tags below.</p>
            <textarea
                value={tags}
                onChange={(e) => onContentUpdate?.('tags', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                rows={5}
            />
        </div>
      )
  }

  const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);

  if (!tagList.length) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube Tags</h3>
        <button
          onClick={() => handleCopy(tags, true)}
          disabled={allCopied}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50"
        >
          {allCopied ? (
            <React.Fragment>
              <CheckIcon className="w-5 h-5" />
              <span>Copied!</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy All</span>
            </React.Fragment>
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click any tag to copy it individually. These are optimized for YouTube SEO.</p>
      <div className="flex flex-wrap gap-3">
        {tagList.map((tag, index) => (
          <button
            key={index}
            onClick={() => handleCopy(tag)}
            className="relative px-4 py-2 bg-gray-200 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 rounded-full hover:bg-purple-500 hover:text-white dark:hover:bg-purple-500/50 transition-all duration-200 text-sm transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
            title={`Copy "${tag}"`}
          >
            {tag}
            {copiedTag === tag && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-full text-white font-bold text-xs animate-fade-in">
                Copied!
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};