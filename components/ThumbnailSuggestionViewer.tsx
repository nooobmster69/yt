import * as React from 'react';
import type { ThumbnailSuggestion } from '../types';
import { Loader } from './Loader';
import { SparklesIcon, PhotoIcon, PaintBrushIcon, ChatBubbleLeftRightIcon, ArrowUturnLeftIcon } from './icons';

interface ThumbnailSuggestionViewerProps {
    suggestions: ThumbnailSuggestion[];
    onGenerate: () => void;
    isGenerating: boolean;
    error: string | null;
    onLoadSuggestion: (suggestion: ThumbnailSuggestion, index: number) => void;
    layoutGenerationState: { status: 'idle' | 'loading' | 'success' | 'error', error: string | null, loadingIndex: number | null };
    onLaunchThumbnailBuilderFromScratch: () => void;
}

const SuggestionCard = ({ suggestion, index, onLoad, isLoading }: { suggestion: ThumbnailSuggestion, index: number, onLoad: () => void, isLoading: boolean }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-950/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-full">
            <div className="flex-grow">
                <h4 className="font-bold text-purple-600 dark:text-purple-400">{suggestion.concept}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{suggestion.whyItWorks}</p>
                <div className="space-y-2 text-sm">
                    <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Visuals:</strong> {suggestion.visuals}</p>
                    <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Text:</strong> "{suggestion.textOverlay.primary}"</p>
                    <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Layout:</strong> {suggestion.layout}</p>
                </div>
            </div>
            <button
                onClick={onLoad}
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-gray-500 transition-all disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        <span>Loading...</span>
                    </>
                ) : (
                     <>
                        <PaintBrushIcon className="w-5 h-5" />
                        <span>Load in Builder</span>
                    </>
                )}
            </button>
        </div>
    );
}

export const ThumbnailSuggestionViewer = ({ suggestions, onGenerate, isGenerating, error, onLoadSuggestion, layoutGenerationState, onLaunchThumbnailBuilderFromScratch }: ThumbnailSuggestionViewerProps) => {

    if (isGenerating && suggestions.length === 0) {
        return <Loader message="Designing thumbnail concepts..." subMessage="The AI is brainstorming viral ideas." />;
    }

    if (error && suggestions.length === 0) {
        return (
            <div className="text-center text-red-700 dark:text-red-400 p-4 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg">
                <h4 className="font-bold mb-2">Thumbnail Design Failed</h4>
                <p>{error}</p>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                    <PhotoIcon className="w-8 h-8"/>
                    Thumbnail Design Studio
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">Generate 3 distinct, high-impact thumbnail concepts based on your video's content, complete with visual descriptions, text overlays, and strategic advice.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="flex items-center mx-auto justify-center gap-3 px-6 py-3 text-base font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <SparklesIcon className="w-6 h-6" />
                        <span>Generate AI Designs</span>
                    </button>
                    <button
                        onClick={onLaunchThumbnailBuilderFromScratch}
                        className="flex items-center mx-auto justify-center gap-3 px-6 py-3 text-base font-bold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        <PaintBrushIcon className="w-6 h-6" />
                        <span>Create From Scratch</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Thumbnail Concepts</h3>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50"
                >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div> : <ArrowUturnLeftIcon className="w-4 h-4"/>}
                    <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
            </div>
             {error && <div className="my-2 text-center text-red-700 dark:text-red-400 p-2 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg text-sm"><p>Regeneration failed: {error}</p></div>}
            
            <div className="grid grid-cols-1 gap-6 mt-6">
                {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                        key={index}
                        suggestion={suggestion}
                        index={index}
                        onLoad={() => onLoadSuggestion(suggestion, index)}
                        isLoading={layoutGenerationState.status === 'loading' && layoutGenerationState.loadingIndex === index}
                    />
                ))}
            </div>
        </div>
    );
};