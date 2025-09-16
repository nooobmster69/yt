import * as React from 'react';
import type { GeneratedContent, Chapter } from '../types';
import { Loader } from './Loader';
import { CopyButton } from './CopyButton';
import { SparklesIcon, ListBulletIcon, ClipboardIcon, CheckIcon, ArrowUturnLeftIcon } from './icons';

interface ChapterViewerProps {
    content: GeneratedContent;
    onGenerate: () => void;
    isGenerating: boolean;
    error: string | null;
    onRemake: () => void;
}

export const ChapterViewer = ({ content, onGenerate, isGenerating, error, onRemake }: ChapterViewerProps) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const formattedChapters = React.useCallback(() => {
        if (!content.chapters) return '';
        return content.chapters
            .map(ch => `${ch.timestamp} - ${ch.title}`)
            .join('\n');
    }, [content.chapters]);

    const handleCopy = React.useCallback(() => {
        if (isCopied) return;
        const textToCopy = formattedChapters();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy chapters: ', err);
            alert('Failed to copy chapters.');
        });
    }, [formattedChapters, isCopied]);

    if (isGenerating && !content.chapters) {
        return <Loader message="Generating chapters..." subMessage="AI is analyzing your script's structure." />;
    }

    if (error && !content.chapters) {
        return (
            <div className="text-center text-red-700 dark:text-red-400 p-4 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg">
                <h4 className="font-bold mb-2">Chapter Generation Failed</h4>
                <p>{error}</p>
            </div>
        );
    }

    if (!content.chapters || content.chapters.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">YouTube Chapter Generator</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">Automatically identify the main sections in your script and generate chapter markers for your YouTube video timeline.</p>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center mx-auto justify-center gap-3 px-6 py-3 text-base font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <SparklesIcon className="w-6 h-6" />
                    <span>Generate Chapters</span>
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube Chapters</h3>
                <div className="flex items-center gap-2">
                     <button onClick={onRemake} disabled={isGenerating} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50">
                        {isGenerating ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div> : <ArrowUturnLeftIcon className="w-4 h-4"/>}
                        <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={isCopied}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-purple-500 transition-all disabled:bg-green-600 disabled:cursor-default"
                    >
                        {isCopied ? (
                            <><CheckIcon className="w-5 h-5" /> Copied!</>
                        ) : (
                            <><ClipboardIcon className="w-5 h-5" /> Copy for YouTube</>
                        )}
                    </button>
                </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Paste this directly into your YouTube video description to automatically create chapters.</p>
             {error && <div className="my-2 text-center text-red-700 dark:text-red-400 p-2 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg text-sm"><p>Regeneration failed: {error}</p></div>}
            
            <div className="bg-gray-50 dark:bg-gray-900/70 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <ul className="space-y-4">
                    {content.chapters.map((chapter, index) => (
                        <li key={index} className="flex items-center">
                            <ListBulletIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-4 flex-shrink-0" />
                            <span className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-400 mr-3">{chapter.timestamp}</span>
                            <span className="text-gray-800 dark:text-gray-200 font-medium">{chapter.title}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};