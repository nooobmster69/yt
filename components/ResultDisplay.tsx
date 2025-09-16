import React from 'react';
import type { GeneratedContent, ThumbnailSuggestion, GenerationLogEntry, ProjectData, TitledPrompt, GroundingChunk, ImageGenerationState, PerPartStatus, ImageGenerationAttempt } from '../types';
import { Loader } from './Loader';
import { SparklesIcon, StopCircleIcon, BookOpenIcon, PhotoIcon, GlobeAltIcon, ArrowUturnLeftIcon, FilmIcon, ClapperboardIcon, CheckIcon, DocumentTextIcon, UserGroupIcon, ChartBarIcon, CalendarDaysIcon, ClockIcon } from './icons';
import { ScriptViewer } from './ScriptViewer';
import { TagsDisplay } from './TagsDisplay';
import { ImagePromptCombiner } from './ImagePromptCombiner';
import { SettingsSummary } from './SettingsSummary';
import { EditingTimelineViewer } from './EditingTimelineViewer';
import { ChapterViewer } from './ChapterViewer';
import { ThumbnailSuggestionViewer } from './ThumbnailSuggestionViewer';
import { CopyButton } from './CopyButton';
import type { Style } from '../services/imageStyles';
import { SettingsPreview } from './SettingsPreview';

interface ResultDisplayProps {
  topic: string;
  generationStatus: 'idle' | 'loading' | 'success' | 'error';
  content: GeneratedContent | null;
  error: string | null;
  onRemake: () => void;
  onGenerateThumbnailSuggestions: () => void;
  isGeneratingThumbnailSuggestions: boolean;
  thumbnailSuggestionError: string | null;
  onLaunchThumbnailBuilder: () => void;
  onLaunchThumbnailBuilderFromScratch: () => void;
  generationLog: GenerationLogEntry[];
  generationSettings: Partial<ProjectData> | null;
  onLoadSuggestion: (suggestion: ThumbnailSuggestion, index: number) => void;
  layoutGenerationState: { status: 'idle' | 'loading' | 'success' | 'error', error: string | null, loadingIndex: number | null };
  styles: Style[];
  recommendedStyles: string[];
  recommendationsReady: boolean;
  onGenerateImagePrompts: (count: number) => void;
  isGeneratingImagePrompts: boolean;
  imagePromptsError: string | null;
  generatedImagePrompts: TitledPrompt[];
  allScenePrompts: TitledPrompt[];
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
  onGenerateChapters: () => void;
  isGeneratingChapters: boolean;
  chaptersError: string | null;
  onRemakeChapters: () => void;
  onGenerateEditingTimeline: () => void;
  isGeneratingTimeline: boolean;
  timelineError: string | null;
  onRemakeEditingTimeline: () => void;
  isEditMode: boolean;
  onContentUpdate: (field: keyof GeneratedContent, value: any) => void;
  onDeepContentUpdate: (keys: (string | number)[], value: any) => void;
  currentSettings: ProjectData;
  onBulkGenerateImages: () => void;
  isBulkGeneratingImages: boolean;
}


interface Source {
    uri: string;
    title: string;
    hostname: string;
}

const getRealUrl = (uri: string): string => { try { const u = new URL(uri.startsWith('http') ? uri : `https://${uri}`); if (u.hostname.endsWith('google.com') && u.searchParams.has('url')) { const f = u.searchParams.get('url'); if (f) return decodeURIComponent(f); } } catch (e) {} return uri; };

const GroundingReferences = ({ chunks }: { chunks: GroundingChunk[] }) => {
    const processedSources = React.useMemo<Source[]>(() => {
        const uniqueSources = new Map<string, Source>();

        chunks.forEach(c => {
            try {
                const realUri = getRealUrl(c.web.uri);
                if (uniqueSources.has(realUri)) return;

                const url = new URL(realUri.startsWith('http') ? realUri : `https://${realUri}`);
                uniqueSources.set(realUri, {
                    uri: realUri,
                    title: c.web.title,
                    hostname: url.hostname.replace(/^www\./, ''),
                });
            } catch (e) {
                console.error("Invalid URI in grounding chunks:", c.web.uri);
            }
        });

        const sources = Array.from(uniqueSources.values());

        // Prioritize trusted sources
        const priorityDomains = ['.gov', '.edu', 'britannica.com', 'history.com', 'si.edu', 'nasa.gov'];
        sources.sort((a, b) => {
            const aIsPriority = priorityDomains.some(d => a.hostname.includes(d));
            const bIsPriority = priorityDomains.some(d => b.hostname.includes(d));
            if (aIsPriority && !bIsPriority) return -1;
            if (!aIsPriority && bIsPriority) return 1;
            return 0;
        });

        return sources;

    }, [chunks]);
    
    const sourcesToShow = processedSources.slice(0, 10);

    return (
        <div className="space-y-4">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                <p>
                    Showing {sourcesToShow.length > 0 ? `the top ${sourcesToShow.length}` : '0'} of {processedSources.length} sources found. Sources are prioritized for quality.
                </p>
            </div>
            {sourcesToShow.map((source, index) => {
                const isSearchUrl = source.hostname.includes('vertexaisearch.cloud.google.com');
                const isTitleJustDomain = source.title.toLowerCase().replace(/^www\./, '') === source.hostname.toLowerCase();
                const showHostname = !isSearchUrl && !isTitleJustDomain;

                return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="font-semibold text-base text-blue-600 dark:text-blue-400 hover:underline break-words">
                            {source.title}
                        </a>
                        {showHostname && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 break-words">
                                {source.hostname}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const GenerationProgressLog = ({ log, settings }: { log: GenerationLogEntry[], settings: Partial<ProjectData> | null }) => {
    const completedCount = log.filter(l => l.status === 'success').length;
    const totalCount = log.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const currentTask = log.find(l => l.status === 'loading');

    return (
        <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/80 space-y-6">
            <SettingsSummary settings={settings} />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Generation Progress</h3>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{completedCount} / {totalCount} Steps Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {currentTask && (
                    <p className="text-center mt-3 text-purple-600 dark:text-purple-300 animate-pulse">
                        Working on: <span className="font-semibold">{currentTask.message}</span>
                    </p>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                {log.map(l => {
                    let icon, color, bgColor;
                    switch (l.status) { 
                        case 'loading': 
                            icon = <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-purple-400"/>; 
                            color="text-purple-600 dark:text-purple-300"; 
                            bgColor="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50";
                            break; 
                        case 'success': 
                            icon = <CheckIcon className="w-5 h-5 text-green-500"/>; 
                            color="text-green-700 dark:text-green-300"; 
                            bgColor="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50";
                            break; 
                        case 'error': 
                            icon = <StopCircleIcon className="w-5 h-5 text-red-500"/>; 
                            color="text-red-700 dark:text-red-300"; 
                            bgColor="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50";
                            break; 
                        default: 
                            icon = <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>; 
                            color="text-gray-500 dark:text-gray-400"; 
                            bgColor="bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700/50";
                    }
                    return (
                        <div key={l.id} className={`p-3 rounded-lg flex items-center justify-between border ${bgColor} transition-all duration-300`}>
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0">{icon}</span>
                                <div className="flex flex-col">
                                    <p className={`font-semibold text-sm ${color}`}>{l.message}</p>
                                    {l.durationMinutes && <p className="text-xs text-gray-500 dark:text-gray-400">Est. {l.durationMinutes} min</p>}
                                </div>
                            </div>
                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${color} ${bgColor.replace('border-', '')}`}>{l.status}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const EditableField = ({ value, onUpdate, isEditMode, rows = 3, placeholder = "Not set" }: { value: string | undefined, onUpdate: (newValue: string) => void, isEditMode: boolean, rows?: number, placeholder?: string }) => {
    if (isEditMode) {
        return (
            <textarea
                value={value || ''}
                onChange={(e) => onUpdate(e.target.value)}
                rows={rows}
                className="w-full bg-white/10 text-gray-200 rounded-md p-2 border-2 border-dashed border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
            />
        )
    }
    return (
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{value || <span className="italic opacity-60">{placeholder}</span>}</p>
    )
}

const MemoizedOverviewTab = React.memo(({ content, isEditMode, onContentUpdate }: { content: GeneratedContent, isEditMode: boolean, onContentUpdate: (field: keyof GeneratedContent, value: any) => void }) => {
    return (
        <div className="space-y-6">
             <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/80 space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Script Metrics</h3>
                    </div>
                    <div className="mt-4 flex justify-around text-center">
                            <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Characters</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-1">{content.fullScript?.length.toLocaleString() ?? '0'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Word Count</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-1">{content.fullScript?.split(/\s+/).filter(Boolean).length.toLocaleString() ?? '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative p-4 bg-purple-50 dark:bg-purple-900/40 rounded-xl border border-purple-200 dark:border-purple-800/50">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-purple-500"/> Video Summary</h3>
                        <EditableField value={content.summary} onUpdate={(v) => onContentUpdate('summary', v)} isEditMode={isEditMode} />
                        {!isEditMode && <CopyButton textToCopy={content.summary} className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10" />}
                    </div>
                    
                    <div className="relative p-4 bg-blue-50 dark:bg-blue-900/40 rounded-xl border border-blue-200 dark:border-blue-800/50">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5 text-blue-500"/> Period</h3>
                        <EditableField value={content.period} onUpdate={(v) => onContentUpdate('period', v)} isEditMode={isEditMode} rows={1} />
                        {!isEditMode && content.period && <CopyButton textToCopy={content.period} className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10" />}
                    </div>
                    <div className="relative p-4 bg-green-50 dark:bg-green-900/40 rounded-xl border border-green-200 dark:border-green-800/50">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><GlobeAltIcon className="w-5 h-5 text-green-500"/> Location</h3>
                        <EditableField value={content.location} onUpdate={(v) => onContentUpdate('location', v)} isEditMode={isEditMode} rows={1} />
                        {!isEditMode && content.location && <CopyButton textToCopy={content.location} className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10" />}
                    </div>

                    {(content.characters || isEditMode) && (
                        <div className="relative p-4 bg-orange-50 dark:bg-orange-900/40 rounded-xl border border-orange-200 dark:border-orange-800/50">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><UserGroupIcon className="w-5 h-5 text-orange-500"/> Main Characters</h3>
                            <EditableField value={content.characters} onUpdate={(v) => onContentUpdate('characters', v)} isEditMode={isEditMode} />
                            {!isEditMode && content.characters && <CopyButton textToCopy={content.characters} className="absolute top-2 right-2 p-1 rounded-full bg-white/5 hover:bg-white/10" />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


export const ResultDisplay = (props: ResultDisplayProps) => {
    const { generationStatus, content, error, onRemake, generationLog, generationSettings, isEditMode, onContentUpdate } = props;
    const [activeTab, setActiveTab] = React.useState('overview');
    
    const totalDuration = React.useMemo(() => {
        if (!content?.fullScript) return '0s';
        const wordCount = content.fullScript.split(/\s+/).filter(Boolean).length;
        const totalSeconds = Math.round((wordCount / 150) * 60);
    
        if (totalSeconds < 1) return '0s';

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
        
        return parts.join(' ');
    }, [content?.fullScript]);


    if (generationStatus === 'loading' && !content) {
        return generationSettings?.useChapterDrivenGeneration && generationLog.length > 0 ? <GenerationProgressLog log={generationLog} settings={generationSettings} /> : <Loader />;
    }

    if (generationStatus === 'error' && !content) {
        return (
            <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Generation Failed</h3><p>{error}</p>
                <button onClick={onRemake} className="mt-4 flex items-center mx-auto gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"><ArrowUturnLeftIcon className="w-5 h-5" /><span>Try Again</span></button>
            </div>
        );
    }

    if (!content) {
        return <SettingsPreview settings={props.currentSettings} />;
    }

    const tabs = [
        { id: 'overview', title: 'Overview', icon: <DocumentTextIcon className="w-5 h-5"/>, component: <MemoizedOverviewTab content={content} isEditMode={isEditMode} onContentUpdate={onContentUpdate} /> },
        { id: 'script', title: 'Script', icon: <BookOpenIcon className="w-5 h-5"/>, component: <ScriptViewer 
            topic={props.topic}
            content={content}
            isGenerating={props.isGenerating}
            onGenerateSSMLForPart={props.onGenerateSSMLForPart}
            ssmlGenerationStates={props.ssmlGenerationStates}
            onBulkGenerateSSML={props.onBulkGenerateSSML}
            isBulkGeneratingSSML={props.isBulkGeneratingSSML}
            directorMode={props.directorMode}
            onGenerateCuesAndPromptsForPart={props.onGenerateCuesAndPromptsForPart}
            promptGenerationStates={props.promptGenerationStates}
            generatedImages={props.generatedImages}
            onGenerateImage={props.onGenerateImage}
            onAdjustImage={props.onAdjustImage}
            isEditMode={isEditMode}
            onContentUpdate={onContentUpdate}
            onDeepContentUpdate={props.onDeepContentUpdate}
        /> },
        { id: 'visuals', title: 'Visuals', icon: <PhotoIcon className="w-5 h-5"/>, component: (
            <div className="space-y-8">
                <ThumbnailSuggestionViewer
                    suggestions={content.thumbnailSuggestions || []}
                    onGenerate={props.onGenerateThumbnailSuggestions}
                    isGenerating={props.isGeneratingThumbnailSuggestions}
                    error={props.thumbnailSuggestionError}
                    onLoadSuggestion={props.onLoadSuggestion}
                    layoutGenerationState={props.layoutGenerationState}
                    onLaunchThumbnailBuilderFromScratch={props.onLaunchThumbnailBuilderFromScratch}
                />
                <TagsDisplay tags={content.tags} isEditMode={isEditMode} onContentUpdate={onContentUpdate} />
                <ImagePromptCombiner
                    thumbnailPrompt={content.thumbnailPrompt}
                    scenePrompts={props.allScenePrompts}
                    generatedImagePrompts={props.generatedImagePrompts}
                    styles={props.styles}
                    recommendedStyles={props.recommendedStyles}
                    recommendationsReady={props.recommendationsReady}
                    generatedImages={props.generatedImages}
                    onGenerateImage={props.onGenerateImage}
                    onAdjustImage={props.onAdjustImage}
                    isEditMode={isEditMode}
                    onDeepContentUpdate={props.onDeepContentUpdate}
                    onGenerate={props.onGenerateImagePrompts}
                    isGenerating={props.isGeneratingImagePrompts}
                    error={props.imagePromptsError}
                    onBulkGenerateImages={props.onBulkGenerateImages}
                    isBulkGeneratingImages={props.isBulkGeneratingImages}
                />
            </div>
        )},
        { id: 'post-production', title: 'Post-Production', icon: <ClapperboardIcon className="w-5 h-5"/>, component: (
            <div className="space-y-6">
               <ChapterViewer 
                    content={content} 
                    onGenerate={props.onGenerateChapters}
                    isGenerating={props.isGeneratingChapters}
                    error={props.chaptersError}
                    onRemake={props.onRemakeChapters}
               />
               <EditingTimelineViewer 
                    content={content} 
                    onGenerate={props.onGenerateEditingTimeline}
                    isGenerating={props.isGeneratingTimeline}
                    error={props.timelineError}
                    onRemake={props.onRemakeEditingTimeline}
               />
            </div>
        )},
    ];

    if (content.groundingChunks && content.groundingChunks.length > 0) {
        tabs.push({ id: 'sources', title: 'Sources', icon: <GlobeAltIcon className="w-5 h-5"/>, component: <GroundingReferences chunks={content.groundingChunks} /> });
    }
    
    const TabButton = ({ id, title, icon }: { id: string, title: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-1 py-3 text-base font-medium border-b-2 transition-colors duration-200 ease-in-out ${
                activeTab === id 
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
        >
            {icon}
            <span>{title}</span>
        </button>
    );
    
    return (
        <div className="space-y-4 animate-fade-in">
             {generationStatus === 'loading' && generationSettings?.useChapterDrivenGeneration && (
                <GenerationProgressLog log={generationLog} settings={generationSettings} />
            )}

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex-1 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex items-center gap-5">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                        <CalendarDaysIcon className="w-8 h-8 text-purple-600 dark:text-purple-300 flex-shrink-0" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400">Created On</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">{content.createdAt ? new Date(content.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                </div>
                <div className="flex-1 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-lg flex items-center gap-5">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                        <ClockIcon className="w-8 h-8 text-purple-600 dark:text-purple-300 flex-shrink-0" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400">Estimated Duration</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">{totalDuration}</p>
                    </div>
                </div>
            </div>

             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => <TabButton key={tab.id} {...tab} />)}
                </nav>
            </div>

            <div className="mt-6">
                {tabs.map(tab => (
                    <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                        {tab.component}
                    </div>
                ))}
            </div>
        </div>
    );
};