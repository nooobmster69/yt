import * as React from 'react';
import type { GeneratedContent, TitledPrompt } from '../types';
import { CloseIcon, Squares2X2Icon, PhotoIcon, DocumentTextIcon, GlobeAltIcon, UserGroupIcon, BookOpenIcon } from './icons';
import { CopyButton } from './CopyButton';
import { TagsDisplay } from './TagsDisplay';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: GeneratedContent | null;
  generatedImagePrompts: TitledPrompt[];
}

const DetailSection = ({ title, content, children, copyText, icon }: { title: string, content?: string | null, children?: React.ReactNode, copyText?: string | null, icon?: React.ReactNode }) => {
    if (!content && !children) return null;

    return (
        <div className="relative bg-gray-50 dark:bg-gray-950/70 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {content && <pre className="font-sans text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{content}</pre>}
            {children}
            {copyText && <CopyButton textToCopy={copyText} />}
        </div>
    );
};

const ImagePromptSection = ({ title, prompts, copyText }: { title: string, prompts: TitledPrompt[], copyText: string }) => {
    if (prompts.length === 0) return null;

    return (
        <div className="bg-gray-50 dark:bg-gray-950/70 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="relative">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5 text-purple-500"/>
                    {title}
                </h3>
                <CopyButton textToCopy={copyText} />
            </div>
            {prompts.map((prompt, index) => (
                <div key={index} className="relative bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">{`${index + 1}. ${prompt.title}`}</h4>
                    <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{prompt.prompt}</pre>
                    <CopyButton textToCopy={prompt.prompt} />
                </div>
            ))}
        </div>
    );
}

export const DetailsModal = ({ isOpen, onClose, content, generatedImagePrompts }: DetailsModalProps) => {
    if (!isOpen || !content) return null;

    const allScenePrompts = (content.scenePrompts ?? []).filter((p): p is TitledPrompt[] => Array.isArray(p)).flat();
    const allInitialPrompts = content.initialImagePrompts || [];
    const allGeneratedPrompts = generatedImagePrompts || [];
    const fullScriptText = content.fullScript || content.script.join('\n\n\n--- PART END ---\n\n\n');
    
    const totalDuration = React.useMemo(() => {
        if (!fullScriptText) return '0m 0s';
        const wordCount = fullScriptText.split(/\s+/).filter(Boolean).length;
        const totalSeconds = (wordCount / 150) * 60;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        return `${minutes}m ${seconds}s`;
    }, [fullScriptText]);

    return (
        <div 
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="details-modal-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Squares2X2Icon className="w-6 h-6 text-purple-500" />
                        Generated Content Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    <div className="grid grid-cols-1 gap-4 text-center">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date Created</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{content.createdAt ? new Date(content.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                         <div className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Duration</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{totalDuration}</p>
                        </div>
                         <div className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Character Count</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{fullScriptText.length.toLocaleString()}</p>
                        </div>
                    </div>

                    <DetailSection title="Video Summary" content={content.summary} copyText={content.summary} icon={<DocumentTextIcon className="w-5 h-5 text-purple-500"/>} />
                    {content.period && <DetailSection title="Period" content={content.period} copyText={content.period} icon={<GlobeAltIcon className="w-5 h-5 text-purple-500"/>} />}
                    {content.location && <DetailSection title="Location" content={content.location} copyText={content.location} icon={<GlobeAltIcon className="w-5 h-5 text-purple-500"/>} />}
                    {content.characters && <DetailSection title="Main Characters" content={content.characters} copyText={content.characters} icon={<UserGroupIcon className="w-5 h-5 text-purple-500"/>} />}
                    
                    <div className="bg-gray-50 dark:bg-gray-950/70 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <TagsDisplay tags={content.tags} />
                    </div>

                    <DetailSection title="Thumbnail Prompt" content={`${content.thumbnailPrompt.title}\n\n${content.thumbnailPrompt.prompt}`} copyText={content.thumbnailPrompt.prompt} icon={<PhotoIcon className="w-5 h-5 text-purple-500"/>} />

                    <ImagePromptSection title="Initial Image Prompts" prompts={allInitialPrompts} copyText={allInitialPrompts.map(p => p.prompt).join('\n\n')} />
                    <ImagePromptSection title="Scene Image Prompts" prompts={allScenePrompts} copyText={allScenePrompts.map(p => p.prompt).join('\n\n')} />
                    <ImagePromptSection title="Bulk Generated Prompts" prompts={allGeneratedPrompts} copyText={allGeneratedPrompts.map(p => p.prompt).join('\n\n')} />

                    <DetailSection title="Full Script" content={fullScriptText} copyText={fullScriptText} icon={<BookOpenIcon className="w-5 h-5 text-purple-500"/>} />
                </main>
            </div>
        </div>
    );
};