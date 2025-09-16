import React from 'react';
import { CopyButton } from './CopyButton';
import { CheckIcon, SparklesIcon, SpeakerWaveIcon, FilmIcon, ChevronDownIcon, ArrowUturnLeftIcon, ClipboardIcon } from './icons';
import { Loader } from './Loader';
import type { GeneratedContent, PerPartStatus, TitledPrompt, ImageGenerationState, ImageGenerationAttempt } from '../types';
import { ImageGenerator } from './ImageGenerator';

const WPM = 150; // Words Per Minute

const calculateDuration = (text: string) => {
    if (!text || text.trim() === '') return { minutes: 0, seconds: 0 };
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const totalSeconds = (wordCount / WPM) * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return { minutes, seconds };
};

const CueMarker = ({ cueNumber }: { cueNumber: number }) => {
    const handleClick = () => {
        const element = document.getElementById(`prompt-card-${cueNumber}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect for better UX
            element.classList.add('bg-purple-100', 'dark:bg-purple-900/30', 'border-purple-400');
            setTimeout(() => {
                element.classList.remove('bg-purple-100', 'dark:bg-purple-900/30', 'border-purple-400');
            }, 1500);
        }
    };

    return (
        <span
            className="relative inline-block align-middle mx-1 group cursor-pointer"
            onClick={handleClick}
            title={`Go to prompt for CUE:${cueNumber}`}
        >
            <span className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-bold ring-2 ring-blue-200 dark:ring-blue-500/30">
                <FilmIcon className="w-4 h-4" />
                CUE:{cueNumber}
            </span>
        </span>
    );
};

export const ScriptViewer = ({ 
    topic,
    content,
    isGenerating,
    onGenerateSSMLForPart,
    ssmlGenerationStates,
    onBulkGenerateSSML,
    isBulkGeneratingSSML,
    directorMode,
    onGenerateCuesAndPromptsForPart,
    promptGenerationStates,
    generatedImages,
    onGenerateImage,
    onAdjustImage,
    isEditMode,
    onContentUpdate,
    onDeepContentUpdate,
}: {
    topic: string;
    content: GeneratedContent;
    isGenerating: boolean;
    onGenerateSSMLForPart: (partIndex: number) => void;
    ssmlGenerationStates: { [key: number]: PerPartStatus };
    onBulkGenerateSSML: () => void;
    isBulkGeneratingSSML: boolean;
    directorMode: boolean;
    onGenerateCuesAndPromptsForPart: (partIndex: number) => void;
    promptGenerationStates: { [key: number]: PerPartStatus };
    generatedImages: Record<string, ImageGenerationState>;
    onGenerateImage: (prompt: string, title: string) => void;
    onAdjustImage: (chainKey: string, imageToAdjust: ImageGenerationAttempt, adjustmentText: string) => void;
    isEditMode: boolean;
    onContentUpdate: (field: 'script', value: string[]) => void;
    onDeepContentUpdate: (keys: (string | number)[], value: any) => void;
}) => {
    const [activeTabIndex, setActiveTabIndex] = React.useState(0);
    const { script } = content;
    const [isFullScriptCopied, setIsFullScriptCopied] = React.useState(false);

    const handleCopyFullScript = React.useCallback(() => {
        if (!content.fullScript || isFullScriptCopied) return;

        navigator.clipboard.writeText(content.fullScript).then(() => {
            setIsFullScriptCopied(true);
            setTimeout(() => setIsFullScriptCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy full script: ', err);
            alert('Failed to copy full script.');
        });
    }, [content.fullScript, isFullScriptCopied]);

    const partDetails = React.useMemo(() => {
        return script.map(part => {
            const duration = calculateDuration(part);
            const charCount = part.length;
            return {
                duration,
                charCount,
                label: `~${duration.minutes}m ${duration.seconds}s • ${charCount} chars`
            };
        });
    }, [script]);

    const allScenePrompts = React.useMemo(() => {
        return (content.scenePrompts ?? []).filter((p): p is TitledPrompt[] => Array.isArray(p)).flat();
    }, [content.scenePrompts]);

    const renderScriptPart = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\[CUE:\d+\])/g);
        return parts.map((part, index) => {
            const cueMatch = part.match(/\[CUE:(\d+)\]/);
            if (cueMatch) {
                const cueNumber = parseInt(cueMatch[1], 10);
                return <CueMarker key={index} cueNumber={cueNumber} />;
            }
            return part;
        });
    };
    
    React.useEffect(() => {
        if (activeTabIndex >= script.length) {
            setActiveTabIndex(Math.max(0, script.length - 1));
        }
    }, [script.length, activeTabIndex]);

    const SsmbButton = ({ partIndex }: { partIndex: number }) => {
        const ssmlState = ssmlGenerationStates[partIndex] || { status: 'idle' };
        const ssmlExists = !!content.ssmlScript?.[partIndex];

        let buttonContent;
        if (ssmlExists) {
            buttonContent = <><CheckIcon className="w-5 h-5 text-green-500" /> SSML Ready</>;
        } else if (ssmlState.status === 'loading') {
            buttonContent = <><div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div> Generating SSML</>;
        } else {
            buttonContent = <><SpeakerWaveIcon className="w-5 h-5" /> Generate SSML</>;
        }

        return (
            <button
                onClick={() => onGenerateSSMLForPart(partIndex)}
                disabled={ssmlExists || ssmlState.status === 'loading'}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50"
            >
                {buttonContent}
            </button>
        );
    };

    const currentScriptPart = script[activeTabIndex] || '';

    const handlePartChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        const newScriptArray = [...script];
        newScriptArray[activeTabIndex] = newText;
        onContentUpdate('script', newScriptArray);
    };
    
    return (
        <div className="space-y-6">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/80">
                 <div className="border-b border-gray-200 dark:border-gray-700/80">
                    <div className="flex items-center overflow-x-auto p-2 space-x-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                        {script.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTabIndex(index)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    activeTabIndex === index
                                        ? 'bg-purple-600 text-white font-bold shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="font-semibold">Part {index + 1}</div>
                                <div className="text-xs opacity-80">{partDetails[index].label}</div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="flex justify-end items-center mb-4 gap-2">
                        {directorMode && <DirectorModeButton partIndex={activeTabIndex} onGenerate={onGenerateCuesAndPromptsForPart} promptState={promptGenerationStates[activeTabIndex]} />}
                        <SsmbButton partIndex={activeTabIndex} />
                        <CopyButton textToCopy={currentScriptPart} className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" />
                    </div>
                    {isEditMode ? (
                        <textarea
                            value={currentScriptPart}
                            onChange={handlePartChange}
                            className="w-full min-h-[400px] p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 text-base leading-relaxed whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200"
                        />
                    ) : (
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-line min-h-[200px]">
                            {renderScriptPart(currentScriptPart)}
                        </div>
                    )}
                    {content.ssmlScript?.[activeTabIndex] && <SSMLViewer ssml={content.ssmlScript[activeTabIndex]} />}
                </div>
                 <div className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-950/70 rounded-b-2xl">
                    <button
                        onClick={onBulkGenerateSSML}
                        disabled={isBulkGeneratingSSML}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50"
                        title="Generate SSML for all parts"
                    >
                         {isBulkGeneratingSSML ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div> : <SpeakerWaveIcon className="w-5 h-5" />}
                        <span>Bulk SSML</span>
                    </button>
                    <button
                        onClick={handleCopyFullScript}
                        disabled={isFullScriptCopied || !content.fullScript}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50"
                        title="Copy the entire script to clipboard"
                    >
                        {isFullScriptCopied ? (
                            <>
                                <CheckIcon className="w-5 h-5 text-green-500" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-5 h-5" />
                                <span>Copy Full Script</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {directorMode && allScenePrompts.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scene Image Prompts</h3>
                    <div className="space-y-4">
                        {content.scenePrompts.map((partPrompts, partIndex) => 
                            partPrompts?.map((prompt, promptIndex) => {
                                const globalCueNumber = allScenePrompts.findIndex(p => p === prompt) + 1;
                                return (
                                <div key={`${partIndex}-${promptIndex}`} id={`prompt-card-${globalCueNumber}`} className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-950/70 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50">
                                    <h5 className="font-bold mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2"><FilmIcon className="w-5 h-5" /> CUE {globalCueNumber}: {prompt.title}</h5>
                                    {isEditMode ? (
                                         <textarea
                                            value={prompt.prompt}
                                            onChange={(e) => onDeepContentUpdate(['scenePrompts', partIndex, promptIndex, 'prompt'], e.target.value)}
                                            rows={5}
                                            className="w-full font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-white/10 text-gray-200 rounded-md p-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
                                        />
                                    ) : (
                                        <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">{prompt.prompt}</pre>
                                    )}
                                    <CopyButton textToCopy={prompt.prompt} />
                                    <ImageGenerator prompt={prompt.prompt} imageState={generatedImages[prompt.prompt]} onGenerate={(p) => onGenerateImage(p, prompt.title)} onAdjustImage={onAdjustImage} />
                                </div>
                            )})
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DirectorModeButton = ({ partIndex, onGenerate, promptState }: { partIndex: number, onGenerate: (partIndex: number) => void, promptState: PerPartStatus }) => {
    const state = promptState || { status: 'idle' };
    let buttonContent;
    if (state.status === 'loading') {
        buttonContent = <><div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-400"></div> Generating Cues</>;
    } else {
        buttonContent = <><FilmIcon className="w-5 h-5" /> Generate Cues & Prompts</>;
    }

    return (
        <button
            onClick={() => onGenerate(partIndex)}
            disabled={state.status === 'loading'}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600/50"
        >
            {buttonContent}
        </button>
    );
};

const SSMLViewer = ({ ssml }: { ssml: string }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    return (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-left text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span>View Generated SSML</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="relative mt-2">
                    <pre className="text-xs p-3 bg-gray-100 dark:bg-black/40 rounded-md max-h-40 overflow-y-auto font-mono text-gray-700 dark:text-gray-300">
                        {ssml}
                    </pre>
                    <CopyButton textToCopy={ssml} />
                </div>
            )}
        </div>
    );
};
