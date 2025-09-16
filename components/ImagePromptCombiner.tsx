import React from 'react';
import type { Style } from '../services/imageStyles';
import { CopyButton } from './CopyButton';
import { Loader } from './Loader';
import { ChevronDownIcon, PhotoIcon, PaintBrushIcon, SparklesIcon, ArrowUturnLeftIcon } from './icons';
import { TitledPrompt, ImageGenerationState, ImageGenerationAttempt } from '../types';
import { ImageGenerator } from './ImageGenerator';

interface ImagePromptCombinerProps {
  thumbnailPrompt?: TitledPrompt;
  scenePrompts: TitledPrompt[];
  generatedImagePrompts?: TitledPrompt[];
  styles: Style[];
  recommendedStyles: string[];
  recommendationsReady: boolean;
  generatedImages: Record<string, ImageGenerationState>;
  onGenerateImage: (prompt: string, title: string) => void;
  onAdjustImage: (chainKey: string, imageToAdjust: ImageGenerationAttempt, adjustmentText: string) => void;
  isEditMode: boolean;
  onDeepContentUpdate: (keys: (string | number)[], value: any) => void;
  // Merged props from ImagePromptGenerator
  onGenerate: (count: number) => void;
  isGenerating: boolean;
  error: string | null;
  onBulkGenerateImages: () => void;
  isBulkGeneratingImages: boolean;
}

export const ImagePromptCombiner = ({ 
    thumbnailPrompt, 
    scenePrompts, 
    generatedImagePrompts, 
    styles, 
    recommendedStyles, 
    recommendationsReady, 
    generatedImages, 
    onGenerateImage, 
    onAdjustImage, 
    isEditMode, 
    onDeepContentUpdate,
    onGenerate,
    isGenerating,
    error,
    onBulkGenerateImages,
    isBulkGeneratingImages,
}: ImagePromptCombinerProps) => {
  const allPrompts = React.useMemo(() => {
    const prompts: TitledPrompt[] = [];
    if (thumbnailPrompt) {
        prompts.push(thumbnailPrompt);
    }
    prompts.push(...(generatedImagePrompts || []));
    prompts.push(...scenePrompts);
    return prompts;
  }, [thumbnailPrompt, scenePrompts, generatedImagePrompts]);
  
  const [selectedSceneIndex, setSelectedSceneIndex] = React.useState(0);
  const [selectedStyle, setSelectedStyle] = React.useState<Style | null>(null);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = React.useState(false);
  const [promptCount, setPromptCount] = React.useState(5);
  const styleDropdownRef = React.useRef<HTMLDivElement>(null);

  const sortedStyles = React.useMemo(() => {
    return styles.slice().sort((a, b) => {
        const aIsRec = recommendedStyles.includes(a.name);
        const bIsRec = recommendedStyles.includes(b.name);
        if (aIsRec && !bIsRec) return -1;
        if (!aIsRec && bIsRec) return 1;
        return 0;
    });
  }, [styles, recommendedStyles]);
  
  React.useEffect(() => {
    if (selectedSceneIndex >= allPrompts.length && allPrompts.length > 0) {
        setSelectedSceneIndex(0);
    }
  }, [allPrompts, selectedSceneIndex]);
  
  React.useEffect(() => {
    if (styles.length > 0 && !selectedStyle) {
      setSelectedStyle(styles[0]);
    } else if (selectedStyle) {
      const updatedSelectedStyle = styles.find(s => s.name === selectedStyle.name);
      if (updatedSelectedStyle && updatedSelectedStyle.prompt !== selectedStyle.prompt) {
          setSelectedStyle(updatedSelectedStyle);
      }
    }
  }, [styles, selectedStyle]);


  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
            setIsStyleDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const finalPrompt = React.useMemo(() => {
    if (allPrompts.length === 0 || !allPrompts[selectedSceneIndex] || !selectedStyle) {
        return ``;
    }
    const scenePrompt = allPrompts[selectedSceneIndex].prompt;
    
    const basePrompt = scenePrompt.replace(/\*\*Style:\*\*.*$/s, '').trim();
    const stylePart = `**Style:** ${selectedStyle.prompt}`;

    return `${basePrompt}\n\n${stylePart}`;
}, [selectedSceneIndex, selectedStyle, allPrompts]);
  
  const handleBulkGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(promptCount);
  }

  const handlePromptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const selectedPrompt = allPrompts[selectedSceneIndex];
      if (!selectedPrompt) return;

      let keys: (string|number)[] = [];
      if (thumbnailPrompt && thumbnailPrompt.prompt === selectedPrompt.prompt && thumbnailPrompt.title === selectedPrompt.title) {
          keys = ['thumbnailPrompt', 'prompt'];
      } else {
          const initialIndex = (generatedImagePrompts || []).findIndex(p => p === selectedPrompt);
          if (initialIndex > -1) {
              keys = ['initialImagePrompts', initialIndex, 'prompt'];
          }
      }

      if (keys.length > 0) {
          onDeepContentUpdate(keys, e.target.value);
      }
  }

  const inputClasses = "mt-1 block w-full bg-gray-200/50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm appearance-none";
  const labelClasses = "block text-sm font-semibold text-gray-700 dark:text-gray-300";
  const selectedPromptObject = allPrompts.length > 0 ? allPrompts[selectedSceneIndex] : null;

  return (
    <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Image Prompt Studio</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto">Generate batches of new prompts, then combine them with artistic styles to create perfect, ready-to-use image prompts.</p>
        
        <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Bulk Generation Tools</h4>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
                <form onSubmit={handleBulkGenerateSubmit} className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="prompt-count" className="font-semibold text-gray-700 dark:text-gray-300">Number of Prompts:</label>
                        <input
                            type="number"
                            id="prompt-count"
                            value={promptCount}
                            onChange={(e) => setPromptCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                            min="1"
                            max="100"
                            disabled={isGenerating}
                            className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-center font-bold"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>Generate New Prompts</span>
                    </button>
                </form>
                <button
                    type="button"
                    onClick={onBulkGenerateImages}
                    disabled={isBulkGeneratingImages || isGenerating || scenePrompts.length === 0}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                    {isBulkGeneratingImages ? 
                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> :
                        <PhotoIcon className="w-5 h-5" />
                    }
                    <span>
                        {isBulkGeneratingImages ? 'Generating Images...' : `Generate All Scene Images (${scenePrompts.length})`}
                    </span>
                </button>
            </div>
            {isGenerating && <Loader message="Generating prompts..." subMessage={`The AI is crafting ${promptCount} unique visual ideas.`} />}
            {isBulkGeneratingImages && <p className="text-center mt-3 text-teal-600 dark:text-teal-300 animate-pulse">Generating images for all scenes. You can see progress in the script view below.</p>}
            {error && (
                <div className="mt-4 text-center text-red-700 dark:text-red-400 p-2 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg text-sm">
                    <p>Prompt Generation failed: {error}</p>
                </div>
            )}
        </div>

        <hr className="my-8 border-gray-300 dark:border-gray-600 border-dashed" />
        
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Prompt & Style Mixer</h4>

        {allPrompts.length === 0 || !selectedStyle ? (
             <div className="text-center p-8 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No prompts available. Generate some prompts above or create a full project to begin.</p>
            </div>
        ) : (
            <>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="scene-select" className={labelClasses}>1. Select a Scene</label>
                        <div className="relative mt-1">
                            <PhotoIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                id="scene-select"
                                value={selectedSceneIndex}
                                onChange={(e) => setSelectedSceneIndex(Number(e.target.value))}
                                className={`${inputClasses} pl-10 pr-10`}
                            >
                                {allPrompts.map((p, index) => (
                                    <option key={index} value={index}>{`${index + 1}. ${p.title}`}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {isEditMode ? (
                            <textarea
                                value={selectedPromptObject?.prompt || ''}
                                onChange={handlePromptTextChange}
                                rows={5}
                                className="mt-2 text-xs w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono border border-dashed border-purple-400"
                            />
                        ) : (
                            <pre className="mt-2 text-xs h-32 overflow-y-auto p-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                                {selectedPromptObject?.prompt}
                            </pre>
                        )}
                    </div>
                    <div>
                        <label className={labelClasses}>2. Select a Style</label>
                        <div ref={styleDropdownRef} className="relative mt-1">
                            <button
                                type="button"
                                onClick={() => setIsStyleDropdownOpen(prev => !prev)}
                                className={`${inputClasses} w-full flex items-center justify-between text-left`}
                            >
                                <span className="flex items-center gap-3">
                                    <img src={selectedStyle.thumbnail} alt={selectedStyle.name} className="w-8 h-8 object-cover rounded-md" />
                                    <span className="font-semibold">{selectedStyle.name}</span>
                                </span>
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </button>

                            {isStyleDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    <ul className="py-1">
                                        {sortedStyles.map(style => {
                                            const isRecommended = recommendedStyles.includes(style.name);
                                            return (
                                                <li key={style.name}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedStyle(style);
                                                            setIsStyleDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <img src={style.thumbnail} alt={style.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold flex items-center gap-2">
                                                                {style.name}
                                                                {isRecommended && <span className="text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-600/20 px-1.5 py-0.5 rounded-full">Recommended</span>}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{style.description}</p>
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs h-32 overflow-y-auto p-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {selectedStyle.prompt}
                        </p>
                    </div>
                </div>
                
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">3. Final Prompt</h4>
                    <div className="relative mt-2">
                        <textarea
                            readOnly
                            value={finalPrompt}
                            className="w-full h-40 p-4 rounded-lg bg-white dark:bg-black/30 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-mono text-sm leading-relaxed"
                        />
                        <CopyButton textToCopy={finalPrompt} className="absolute top-3 right-3 p-2 rounded-lg bg-gray-100/50 dark:bg-white/10 hover:bg-gray-200/50 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all duration-200 disabled:opacity-50" />
                    </div>
                    <ImageGenerator prompt={finalPrompt} imageState={generatedImages[finalPrompt]} onGenerate={(p) => onGenerateImage(p, selectedPromptObject?.title || "Combined Prompt")} onAdjustImage={onAdjustImage} />
                </div>
            </>
        )}
    </div>
  );
}