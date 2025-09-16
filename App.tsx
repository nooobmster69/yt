import React from 'react';
import saveAs from 'file-saver';
import type { GeneratedContent, ProjectData, ScriptStyle, LanguageCode, CanvasElement, ThumbnailSuggestion, GenerationLogEntry, AILogEntry, SSMLStyle, WelcomeStyle, PerPartStatus, TitledPrompt, GroundingChunk, ImageGenerationState, ImageGenerationModel, ImageAspectRatio, CreativeAngle, ImageGenerationAttempt, ScriptStyleDetail, StyleSuggestion, BrandNewStyleSuggestion, CustomStyleOption } from './types';
import {
    generateYouTubeContent,
    generateChapterOutline,
    generateScriptForChapters,
    generateWelcomeScript,
    generateTopicSuggestions,
    extendStory,
    endStory,
    generateImage,
    editImage,
    generateStyleSuggestion,
    generateBrandNewStyle,
} from './services/generationService';
import {
    generateInitialVisuals,
    generateThumbnailSuggestions,
    generateRecommendedStyles,
    generateSSML,
    generateLayoutFromSuggestion,
    generateCuesAndPromptsForPart,
    generateImagePrompts,
    generateEditingTimeline,
    generateChapters,
    generatePromptFromLayout,
    generateSEOTags,
} from './services/postProcessingService';
import { setManualApiKeyConfig, testApiKey as testApiKeyService, hasDefaultApiKey } from './services/apiService';
import { WPM, splitScriptIntoChunks } from './services/utils';
import { exportToDocx } from './services/wordService';
import { exportToHtml } from './services/htmlExportService';
import { ResultDisplay } from './components/ResultDisplay';
import { PromptModal } from './components/PromptModal';
import { ThumbnailBuilderModal } from './components/ThumbnailBuilderModal';
import { GeneratorForm } from './components/GeneratorForm';
import { LoadIcon, SaveIcon, SunIcon, MoonIcon, GiftIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, QuestionMarkCircleIcon, SparklesIcon, PaintBrushIcon, WordIcon, HtmlIcon, DocumentTextIcon, StopCircleIcon, ArrowUturnLeftIcon, PhotoIcon } from './components/icons';
import { AILogViewer } from './components/AILogViewer';
import { ZoomControl } from './components/ZoomControl';
import { supportedLanguages, sanitizeProjectData } from './types';
import { WhatsNewModal } from './components/WhatsNewModal';
import { ImageStyleLibrary } from './components/ImageStyleLibrary';
import { DetailsModal } from './components/DetailsModal';
import { UserGuideModal } from './components/UserGuideModal';
import { styles as defaultStyles, Style } from './services/imageStyles';
import { GeneratedSettingsDisplay } from './components/GeneratedSettingsDisplay';
import { ImageGalleryModal } from './components/ImageGalleryModal';

type AsyncState<T> = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
};

const initialGenerationState: AsyncState<GeneratedContent> = {
  status: 'idle',
  data: null,
  error: null,
};

const initialSuggestionState: AsyncState<string[]> = {
  status: 'idle',
  data: [],
  error: null,
};

const initialActionState: AsyncState<null> = {
    status: 'idle',
    data: null,
    error: null,
}

const initialProjectData: Omit<ProjectData, 'generatedContent'> = {
    channelName: 'History Uncovered',
    topic: '',
    storyBrief: '',
    styleSuggestionGuide: '',
    welcomeScriptConcept: '',
    contentTone: '',
    storyFocus: 'personal',
    scriptStyle: 'narrative',
    ssmlStyle: 'standard',
    welcomeStyle: 'energetic',
    mentionChannelNameInWelcome: true,
    creativeAngle: 'standard',
    language: 'en',
    useSimpleWords: false,
    useDailyLanguage: false,
    useExtendedGeneration: true,
    useChapterDrivenGeneration: false,
    useGoogleSearch: false,
    summaryWordCount: 100,
    totalDurationMinutes: 150,
    partDurationMinutes: 6,
    numberOfInitialPrompts: 5,
    generationMode: 'quality',
    generationModel: 'gemini-2.5-flash',
    imageGenerationModel: 'imagen-4.0-generate-001',
    imageAspectRatio: '16:9',
    directorMode: true,
    thumbnailText: '',
    autoGenerateChapters: true,
    autoGenerateEditingTimeline: true,
    thumbnailBuilderElements: [],
    thumbnailBackground: '',
    recommendedStyles: [],
    generatedImagePrompts: [],
    generatedImages: {},
};

const hasDefaultKey = hasDefaultApiKey();

const MemoizedGeneratorForm = React.memo(GeneratorForm);
const MemoizedResultDisplay = React.memo(ResultDisplay);

export const App = () => {
  const [apiKey, setApiKey] = React.useState('');
  const [apiKeyStatus, setApiKeyStatus] = React.useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [apiKeyTestMessage, setApiKeyTestMessage] = React.useState('');
  const [useManualKeyForImagesOnly, setUseManualKeyForImagesOnly] = React.useState(false);
  
  const [projectData, setProjectData] = React.useState<ProjectData>({ ...initialProjectData, generatedContent: null });

  const [generationState, setGenerationState] = React.useState(initialGenerationState);
  const [suggestionState, setSuggestionState] = React.useState(initialSuggestionState);
  const [styleSuggestionState, setStyleSuggestionState] = React.useState<AsyncState<StyleSuggestion>>({ status: 'idle', data: null, error: null });
  const [brandNewStyleState, setBrandNewStyleState] = React.useState<AsyncState<BrandNewStyleSuggestion>>({ status: 'idle', data: null, error: null });
  const [extensionState, setExtensionState] = React.useState(initialActionState);
  const [endingState, setEndingState] = React.useState(initialActionState);
  const [thumbnailSuggestionState, setThumbnailSuggestionState] = React.useState(initialActionState);
  const [timelineState, setTimelineState] = React.useState(initialActionState);
  const [chaptersState, setChaptersState] = React.useState(initialActionState);
  const [layoutGenerationState, setLayoutGenerationState] = React.useState<{ status: 'idle' | 'loading' | 'success' | 'error', error: string | null, loadingIndex: number | null }>({ status: 'idle', error: null, loadingIndex: null });
  const [ssmlGenerationStates, setSsmlGenerationStates] = React.useState<{ [key: number]: PerPartStatus }>({});
  const [promptGenerationStates, setPromptGenerationStates] = React.useState<{ [key: number]: PerPartStatus }>({});
  const [imagePromptState, setImagePromptState] = React.useState<AsyncState<TitledPrompt[]>>({ status: 'idle', data: [], error: null });
  const [generationLog, setGenerationLog] = React.useState<GenerationLogEntry[]>([]);
  const [isBulkGeneratingSSML, setIsBulkGeneratingSSML] = React.useState(false);
  const [isBulkGeneratingImages, setIsBulkGeneratingImages] = React.useState(false);
  const [aiLogs, setAiLogs] = React.useState<AILogEntry[]>([]);
  const [isLogVisible, setIsLogVisible] = React.useState(false);
  const logCounterRef = React.useRef(0);

  const [isContentExtendable, setIsContentExtendable] = React.useState<boolean>(false);

  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [isExportingHtml, setIsExportingHtml] = React.useState(false);
  const [htmlExportError, setHtmlExportError] = React.useState<string | null>(null);

  const [isPromptModalOpen, setIsPromptModalOpen] = React.useState(false);
  const [isThumbnailBuilderOpen, setIsThumbnailBuilderOpen] = React.useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = React.useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  const [theme, setTheme] = React.useState('light');
  const [zoom, setZoom] = React.useState(1);

  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = React.useState(false);

  const [isEditMode, setIsEditMode] = React.useState(false);

  const [editedStylePrompts, setEditedStylePrompts] = React.useState<Record<string, string>>({});
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);
  
  const cancelGenerationRef = React.useRef(false);
  
  const handleSettingChange = React.useCallback((field: keyof ProjectData, value: any) => {
    setProjectData(prev => {
        const newState = {...prev, [field]: value};
        
        // If a standard style is chosen, clear the corresponding AI-generated style.
        if (field === 'scriptStyle' && value !== (newState.brandNewScriptStyle?.id ?? '')) {
            delete newState.brandNewScriptStyle;
        }
        if (field === 'creativeAngle' && value !== (newState.brandNewCreativeAngle?.id ?? '')) {
            delete newState.brandNewCreativeAngle;
        }
        if (field === 'welcomeStyle' && value !== (newState.brandNewWelcomeStyle?.id ?? '')) {
            delete newState.brandNewWelcomeStyle;
        }

        return newState;
    });
    setSelectedPreset(null);
  }, []);

  React.useEffect(() => {
    const newSize = 17 * zoom;
    document.documentElement.style.fontSize = `${newSize}px`;
  }, [zoom]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);


  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const isGeneratingAnything = React.useMemo(() => 
    generationState.status === 'loading' || 
    suggestionState.status === 'loading' ||
    styleSuggestionState.status === 'loading' ||
    brandNewStyleState.status === 'loading' ||
    extensionState.status === 'loading' || 
    endingState.status === 'loading' || 
    thumbnailSuggestionState.status === 'loading' || 
    timelineState.status === 'loading' ||
    chaptersState.status === 'loading' || 
    layoutGenerationState.status === 'loading' ||
    imagePromptState.status === 'loading' ||
    isBulkGeneratingSSML ||
    isBulkGeneratingImages ||
    Object.values(ssmlGenerationStates).some((s: PerPartStatus) => s.status === 'loading') ||
    Object.values(promptGenerationStates).some((s: PerPartStatus) => s.status === 'loading') ||
    Object.values(projectData.generatedImages ?? {}).some((s: ImageGenerationState) => s.status === 'loading'),
    [generationState.status, suggestionState.status, styleSuggestionState.status, brandNewStyleState.status, extensionState.status, endingState.status, thumbnailSuggestionState.status, timelineState.status, chaptersState.status, layoutGenerationState.status, imagePromptState.status, isBulkGeneratingSSML, isBulkGeneratingImages, ssmlGenerationStates, promptGenerationStates, projectData.generatedImages]
  );
  
    // Effect to re-chunk the script when part duration changes
    React.useEffect(() => {
        if (!generationState.data?.fullScript) {
            return;
        }

        const timerId = setTimeout(() => {
            const wordsPerChunk = projectData.partDurationMinutes * WPM;
            const newScriptChunks = splitScriptIntoChunks(generationState.data.fullScript!, wordsPerChunk);

            setGenerationState(prevState => {
                if (!prevState.data || !prevState.data.fullScript) return prevState;

                const oldChunkCount = prevState.data.script.length;

                const newState = {
                    ...prevState,
                    data: {
                        ...prevState.data,
                        script: newScriptChunks,
                    }
                };
                
                if (newScriptChunks.length !== oldChunkCount) {
                    newState.data.ssmlScript = Array(newScriptChunks.length).fill('');
                    newState.data.scenePrompts = Array(newScriptChunks.length).fill(undefined);
                    setSsmlGenerationStates({});
                    setPromptGenerationStates({});
                }

                return newState;
            });
        }, 300);

        return () => clearTimeout(timerId);

    }, [projectData.partDurationMinutes, generationState.data?.fullScript]);

    React.useEffect(() => {
        if (apiKey) {
            setManualApiKeyConfig(apiKey, useManualKeyForImagesOnly);
        } else {
            setManualApiKeyConfig(undefined, true);
        }
    }, [apiKey, useManualKeyForImagesOnly]);

    const handleApiKeyChange = (key: string) => {
        setApiKey(key);
        setApiKeyStatus('idle');
        setApiKeyTestMessage('');
    };

    const handleTestApiKey = async () => {
        if (!apiKey) {
            setApiKeyStatus('invalid');
            setApiKeyTestMessage('API Key cannot be empty.');
            return;
        }
        setApiKeyStatus('testing');
        const result = await testApiKeyService(apiKey);
        setApiKeyStatus(result.valid ? 'valid' : 'invalid');
        setApiKeyTestMessage(result.message);
    };

  const handleContentUpdate = React.useCallback((field: keyof GeneratedContent, value: any) => {
    setGenerationState(prevState => {
        if (!prevState.data) return prevState;
        
        const newData: GeneratedContent = { ...prevState.data, [field]: value };
        
        if (field === 'script' && Array.isArray(value)) {
            newData.fullScript = value.join('\n\n');
        }

        return { ...prevState, data: newData };
    });
  }, []);
  
  const handleDeepContentUpdate = React.useCallback((keys: (string | number)[], value: any) => {
      setGenerationState(prevState => {
          if (!prevState.data) return prevState;

          const newData = JSON.parse(JSON.stringify(prevState.data)); // Deep copy
          let current = newData;
          for (let i = 0; i < keys.length - 1; i++) {
              current = current[keys[i]];
              if (current === undefined) return prevState; // Path doesn't exist
          }
          current[keys[keys.length - 1]] = value;

          return { ...prevState, data: newData };
      });
  }, []);

  const handleUpdateStylePrompt = React.useCallback((styleName: string, newPrompt: string) => {
    setEditedStylePrompts(prev => ({ ...prev, [styleName]: newPrompt }));
  }, []);

  const handleResetStylePrompt = React.useCallback((styleName: string) => {
    setEditedStylePrompts(prev => {
        const newState = { ...prev };
        delete newState[styleName];
        return newState;
    });
  }, []);

  const customizedStyles = React.useMemo<Style[]>(() => {
    return defaultStyles.map(style => {
        const isCustomized = editedStylePrompts.hasOwnProperty(style.name);
        return {
            ...style,
            prompt: isCustomized ? editedStylePrompts[style.name] : style.prompt,
            isCustomized: isCustomized,
        };
    });
  }, [editedStylePrompts]);

  const handleApplyPreset = React.useCallback((preset: { name: string; settings: Partial<Omit<ProjectData, 'generatedContent'>> }) => {
    setProjectData(prev => {
        const updated = { ...initialProjectData, generatedContent: prev.generatedContent, ...preset.settings };
        delete updated.brandNewScriptStyle;
        delete updated.brandNewCreativeAngle;
        delete updated.brandNewWelcomeStyle;
        return updated;
    });
    setSelectedPreset(preset.name);
  }, []);

  const addAiLogEntry = React.useCallback((logData: Omit<AILogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AILogEntry = {
        id: logCounterRef.current++,
        timestamp: new Date().toLocaleTimeString(),
        ...logData
    };
    setAiLogs(prev => [newEntry, ...prev]);
  }, []);

  const handleClearLogs = React.useCallback(() => {
    setAiLogs([]);
  }, []);

  const handleInterrupt = React.useCallback(() => {
    cancelGenerationRef.current = true;
  }, []);

  const handleGenerateEditingTimeline = React.useCallback(async (contentOverride?: GeneratedContent) => {
      const dataToUse = contentOverride || generationState.data;
      if (!dataToUse) return;

      cancelGenerationRef.current = false;
      setTimelineState({ status: 'loading', data: null, error: null });

      const logEntry: GenerationLogEntry = { id: Date.now(), message: `Generating editing timeline...`, status: 'loading' };
      if (contentOverride) setGenerationLog(prev => [...prev, logEntry]);

      try {
          const { script, summary, characters } = dataToUse;
          const timeline = await generateEditingTimeline(script, summary, characters, projectData.language, projectData.generationModel, addAiLogEntry);
          
          if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
          
          setGenerationState(prevState => ({
              ...prevState,
              data: prevState.data ? { ...prevState.data, editingTimeline: timeline } : null,
          }));
          setTimelineState({ status: 'success', data: null, error: null });
          if (contentOverride) setGenerationLog(prev => prev.map(l => l.id === logEntry.id ? {...l, status: 'success'} : l));

      } catch (err) {
          const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setTimelineState({ status: 'error', data: null, error: isCancelled ? 'Timeline generation was cancelled.' : errorMessage });
          if (contentOverride) setGenerationLog(prev => prev.map(l => l.id === logEntry.id ? {...l, status: 'error', details: errorMessage } : l));
      }
  }, [generationState.data, projectData.language, projectData.generationModel, addAiLogEntry]);

  const handleGenerateChapters = React.useCallback(async (contentOverride?: GeneratedContent) => {
    const dataToUse = contentOverride || generationState.data;
    if (!dataToUse) return;

    cancelGenerationRef.current = false;
    setChaptersState({ status: 'loading', data: null, error: null });

    const logEntry: GenerationLogEntry = { id: Date.now(), message: `Generating chapters...`, status: 'loading' };
    if (contentOverride) setGenerationLog(prev => [...prev, logEntry]);

    try {
        const chapters = await generateChapters(dataToUse.script, projectData.language, projectData.generationModel, addAiLogEntry);
        if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

        setGenerationState(prevState => ({
            ...prevState,
            data: prevState.data ? { ...prevState.data, chapters } : null,
        }));
        setChaptersState({ status: 'success', data: null, error: null });
        if (contentOverride) setGenerationLog(prev => prev.map(l => l.id === logEntry.id ? {...l, status: 'success'} : l));

    } catch (err) {
        const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setChaptersState({ status: 'error', data: null, error: isCancelled ? 'Chapter generation was cancelled.' : errorMessage });
        if (contentOverride) setGenerationLog(prev => prev.map(l => l.id === logEntry.id ? {...l, status: 'error', details: errorMessage } : l));
    }
  }, [generationState.data, projectData.language, projectData.generationModel, addAiLogEntry]);

  const handleGenerate = React.useCallback(async (isRemake = false) => {
    if (isGeneratingAnything && !isRemake) return;
    
    if (!projectData.topic.trim()) {
      setGenerationState({ ...initialGenerationState, status: 'error', error: 'Please enter a topic for your video script.' });
      return;
    }
    
    cancelGenerationRef.current = false;
    setGenerationLog([]);
    setGenerationState({ status: 'loading', data: null, error: null });
    setExportError(null); setHtmlExportError(null); setExtensionState(initialActionState);
    setEndingState(initialActionState); setThumbnailSuggestionState(initialActionState);
    setTimelineState(initialActionState); setChaptersState(initialActionState);
    setLayoutGenerationState({ status: 'idle', error: null, loadingIndex: null });
    setSsmlGenerationStates({}); setPromptGenerationStates({});
    setImagePromptState({ status: 'idle', data: [], error: null });
    handleSettingChange('recommendedStyles', []);
    handleSettingChange('generatedImages', {});
    setIsContentExtendable(projectData.useExtendedGeneration && !projectData.useChapterDrivenGeneration);

    let scriptBuffer = '';
    const updateStateWithBuffer = () => {
        if (scriptBuffer.length === 0) return;
        
        let bufferToProcess = scriptBuffer;
        scriptBuffer = '';
        
        const lastParagraphBreak = bufferToProcess.lastIndexOf('\n\n');
        if (lastParagraphBreak !== -1) {
            scriptBuffer = bufferToProcess.substring(lastParagraphBreak + 2);
            bufferToProcess = bufferToProcess.substring(0, lastParagraphBreak + 2);
        }
        
        setGenerationState(prev => {
            if (!prev.data) return prev;
            const newFullScript = (prev.data.fullScript || '') + bufferToProcess;
            const newScriptChunks = splitScriptIntoChunks(newFullScript, projectData.partDurationMinutes * WPM);
            return {
                ...prev,
                data: { ...prev.data, fullScript: newFullScript, script: newScriptChunks },
            };
        });
    };

    try {
        if (projectData.useChapterDrivenGeneration) {
            
            let accumulatedGroundingChunks: GroundingChunk[] = [];
            setGenerationLog(prev => [...prev, { id: Date.now() + 1, message: "Generating chapter outline...", status: 'loading' }]);
            const outline = await generateChapterOutline(projectData.topic, projectData.storyBrief, projectData.totalDurationMinutes, projectData.storyFocus, projectData.creativeAngle, projectData.language, projectData.summaryWordCount, projectData.generationModel, addAiLogEntry);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

            const chapterLogs: GenerationLogEntry[] = outline.chapters.map((c, i) => ({
                id: Date.now() + i + 2, message: c.title, status: 'pending', durationMinutes: c.durationMinutes
            }));

            const initialContent: GeneratedContent = {
                createdAt: new Date().toISOString(),
                summary: outline.summary, tags: '', period: outline.period, location: outline.location, characters: outline.characters,
                thumbnailPrompt: { title: "Thumbnail", prompt: "" },
                initialImagePrompts: [],
                fullScript: '', 
                script: [], 
                scenePrompts: [], 
                groundingChunks: [],
                generationProgress: chapterLogs.map(l => ({ chapterTitle: l.message, status: l.status as any, durationMinutes: l.durationMinutes })),
                brandNewScriptStyle: projectData.brandNewScriptStyle,
                brandNewCreativeAngle: projectData.brandNewCreativeAngle,
                brandNewWelcomeStyle: projectData.brandNewWelcomeStyle,
            };
            setGenerationState({ status: 'loading', data: initialContent, error: null });
            
            setGenerationLog(prev => [...prev.filter(l => l.status !== 'loading'), { ...prev.find(l => l.status === 'loading')!, status: 'success' }, ...chapterLogs]);

            let fullScriptForContext = '';
            let chaptersToBatch = [...outline.chapters];

            if (chaptersToBatch.length > 0 && chaptersToBatch[0].title.toLowerCase().includes('introduction')) {
                const introChapter = chaptersToBatch.shift()!;
                setGenerationLog(prev => prev.map(l => l.message === introChapter.title ? {...l, status: 'loading'} : l));
                const { script: welcomeText, groundingChunks: welcomeChunks } = await generateWelcomeScript(
                    projectData.channelName, projectData.topic, projectData.welcomeStyle, projectData.scriptStyle, projectData.language, projectData.generationModel, addAiLogEntry, projectData.useGoogleSearch, projectData.welcomeScriptConcept, outline.summary, projectData.mentionChannelNameInWelcome
                );
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
                
                if (welcomeChunks) {
                    accumulatedGroundingChunks.push(...welcomeChunks);
                    setGenerationState(prev => {
                        if (!prev.data) return prev;
                        const existingChunks = prev.data.groundingChunks || [];
                        const newChunks = [...existingChunks, ...welcomeChunks];
                        const uniqueChunks = Array.from(new Map(newChunks.map(item => [item.web.uri, item])).values());
                        return { ...prev, data: { ...prev.data, groundingChunks: uniqueChunks }};
                    });
                }
                
                scriptBuffer += welcomeText + '\n\n';
                fullScriptForContext += welcomeText + '\n\n';
                updateStateWithBuffer();
                setGenerationLog(prev => prev.map(l => l.message === introChapter.title ? {...l, status: 'success'} : l));
            }

            const batches: { title: string; durationMinutes: number }[][] = [];
            let currentBatch: { title: string; durationMinutes: number }[] = [];
            let currentBatchDuration = 0;
            const maxBatchDuration = 60;

            for (const chapter of chaptersToBatch) {
                if (currentBatch.length > 0 && currentBatchDuration + chapter.durationMinutes > maxBatchDuration) {
                    batches.push(currentBatch);
                    currentBatch = [];
                    currentBatchDuration = 0;
                }
                currentBatch.push(chapter);
                currentBatchDuration += chapter.durationMinutes;
            }
            if (currentBatch.length > 0) batches.push(currentBatch);
            
            const fullChapterTitles = outline.chapters.map(c => c.title);
            for (const batch of batches) {
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
                
                const batchTitles = batch.map(c => c.title);
                setGenerationLog(prev => prev.map(l => batchTitles.includes(l.message) ? {...l, status: 'loading'} : l));

                const stream = generateScriptForChapters(
                    projectData.topic, batch, fullChapterTitles, fullScriptForContext, projectData.scriptStyle, projectData.creativeAngle, projectData.language, projectData.generationModel, addAiLogEntry, projectData.useGoogleSearch
                );

                for await (const update of stream) {
                    if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
                    if(update.type === 'scriptChunk' && update.chunk) {
                        scriptBuffer += update.chunk;
                        fullScriptForContext += update.chunk;
                        if (scriptBuffer.includes('\n\n')) {
                            updateStateWithBuffer();
                        }
                    }
                    if(update.type === 'groundingChunk' && update.groundingChunks) {
                        accumulatedGroundingChunks.push(...update.groundingChunks);
                        setGenerationState(prev => {
                            if (!prev.data) return prev;
                            const existingChunks = prev.data.groundingChunks || [];
                            const newChunks = [...existingChunks, ...update.groundingChunks!];
                            const uniqueChunks = Array.from(new Map(newChunks.map(item => [item.web.uri, item])).values());
                            return { ...prev, data: { ...prev.data, groundingChunks: uniqueChunks }};
                        });
                    }
                }
                setGenerationLog(prev => prev.map(l => batchTitles.includes(l.message) ? {...l, status: 'success'} : l));
            }

            setGenerationLog(prev => [...prev, { id: Date.now(), message: 'Generating Conclusion...', status: 'loading' }]);
            const outroText = await endStory(fullScriptForContext, outline.characters, projectData.topic, projectData.storyBrief, projectData.channelName, projectData.useSimpleWords, projectData.useDailyLanguage, projectData.generationMode, projectData.generationModel, projectData.scriptStyle, projectData.creativeAngle, projectData.language, addAiLogEntry, projectData.contentTone);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            scriptBuffer += '\n\n' + outroText;
            fullScriptForContext += '\n\n' + outroText;
            updateStateWithBuffer();
            setGenerationLog(prev => prev.map(l => l.message === 'Generating Conclusion...' ? {...l, status: 'success'} : l));
            
            const finalScriptText = fullScriptForContext;
            const finalScriptChunks = splitScriptIntoChunks(finalScriptText, projectData.partDurationMinutes * WPM);

            const contentBeforeVisuals: GeneratedContent = {
                createdAt: initialContent.createdAt,
                summary: outline.summary,
                tags: '',
                period: outline.period,
                location: outline.location,
                characters: outline.characters,
                fullScript: finalScriptText,
                script: finalScriptChunks,
                scenePrompts: Array(finalScriptChunks.length).fill(undefined),
                ssmlScript: Array(finalScriptChunks.length).fill(''),
                thumbnailPrompt: { title: 'Thumbnail', prompt: '' },
                initialImagePrompts: [],
                groundingChunks: Array.from(new Map(accumulatedGroundingChunks.map(item => [item.web.uri, item])).values()),
                brandNewScriptStyle: projectData.brandNewScriptStyle,
                brandNewCreativeAngle: projectData.brandNewCreativeAngle,
                brandNewWelcomeStyle: projectData.brandNewWelcomeStyle,
            };

            setGenerationLog(prev => [...prev, { id: Date.now(), message: 'Generating visual prompts...', status: 'loading' }]);
            const visuals = await generateInitialVisuals(projectData.topic, contentBeforeVisuals.summary, contentBeforeVisuals.fullScript, contentBeforeVisuals.characters, projectData.numberOfInitialPrompts, projectData.thumbnailText, projectData.language, projectData.generationModel, addAiLogEntry);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            
            setGenerationLog(prev => prev.map(l => l.message === 'Generating visual prompts...' ? { ...l, status: 'success' } : l));
            
            setGenerationLog(prev => [...prev, { id: Date.now(), message: 'Optimizing SEO tags...', status: 'loading' }]);
            const seoTags = await generateSEOTags(projectData.topic, contentBeforeVisuals.summary, projectData.generationModel, addAiLogEntry);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            
            const finalContentWithTags: GeneratedContent = { ...contentBeforeVisuals, ...visuals, tags: seoTags };
            setGenerationState({ status: 'success', data: finalContentWithTags, error: null });
            setGenerationLog(prev => prev.map(l => l.message === 'Optimizing SEO tags...' ? { ...l, status: 'success' } : l));


            if (finalContentWithTags.summary) {
                const recs = await generateRecommendedStyles(finalContentWithTags.summary, finalContentWithTags.characters, projectData.generationModel, addAiLogEntry);
                if (!cancelGenerationRef.current) handleSettingChange('recommendedStyles', recs);
            }
            if (projectData.autoGenerateChapters) await handleGenerateChapters(finalContentWithTags);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            if (projectData.autoGenerateEditingTimeline) await handleGenerateEditingTimeline(finalContentWithTags);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

        } else {
            const stream = generateYouTubeContent(projectData.channelName, projectData.topic, projectData.storyBrief, projectData.storyFocus, projectData.scriptStyle, projectData.creativeAngle, projectData.useSimpleWords, projectData.useDailyLanguage, projectData.useExtendedGeneration, projectData.useGoogleSearch, projectData.totalDurationMinutes, projectData.generationMode, projectData.generationModel, projectData.language, projectData.summaryWordCount, projectData.numberOfInitialPrompts, projectData.welcomeStyle, addAiLogEntry, projectData.welcomeScriptConcept, projectData.mentionChannelNameInWelcome, projectData.thumbnailText, projectData.contentTone);
            
            for await (const update of stream) {
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
                if (update.type === 'metadata') {
                    const initialContent: GeneratedContent = { 
                        ...update.data, 
                        createdAt: new Date().toISOString(), 
                        fullScript: '', 
                        script: [], 
                        scenePrompts: [],
                        tags: '',
                        brandNewScriptStyle: projectData.brandNewScriptStyle,
                        brandNewCreativeAngle: projectData.brandNewCreativeAngle,
                        brandNewWelcomeStyle: projectData.brandNewWelcomeStyle,
                    };
                    setGenerationState(prev => ({ ...prev, data: initialContent }));
                } else if (update.type === 'scriptChunk' && update.chunk) {
                    scriptBuffer += update.chunk;
                    if (update.chunk.includes('\n\n')) {
                        updateStateWithBuffer();
                    }
                } else if (update.type === 'groundingChunk' && update.groundingChunks) {
                    setGenerationState(prev => {
                        if (!prev.data) return prev;
                        const existingChunks = prev.data.groundingChunks || [];
                        const newChunks = [...existingChunks, ...update.groundingChunks!];
                        const uniqueChunks = Array.from(new Map(newChunks.map(item => [item.web.uri, item])).values());
                        return { ...prev, data: { ...prev.data, groundingChunks: uniqueChunks }};
                    });
                }
            }
            updateStateWithBuffer();

            let finalContent: GeneratedContent | null = null;
            setGenerationState(prevState => {
                finalContent = prevState.data;
                return { ...prevState, status: 'success' };
            });

            if (finalContent) {
                const seoTags = await generateSEOTags(projectData.topic, finalContent.summary, projectData.generationModel, addAiLogEntry);
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

                const finalContentWithTags: GeneratedContent = { ...finalContent, tags: seoTags };
                setGenerationState({ status: 'success', data: finalContentWithTags, error: null });

                if (finalContentWithTags.summary) {
                    const recs = await generateRecommendedStyles(finalContentWithTags.summary, finalContentWithTags.characters, projectData.generationModel, addAiLogEntry);
                    if (!cancelGenerationRef.current) handleSettingChange('recommendedStyles', recs);
                }
                if (projectData.autoGenerateChapters) await handleGenerateChapters(finalContentWithTags);
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
                if (projectData.autoGenerateEditingTimeline) await handleGenerateEditingTimeline(finalContentWithTags);
                if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            } else {
                throw new Error("Final content was not available after generation.");
            }
        }

    } catch (err) {
      const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
      const errorMessage = err instanceof Error ? err.message : `Generation failed. ${err instanceof Error ? err.message : 'An unknown error occurred.'}`;
      setGenerationState(prevState => ({
          status: 'error', 
          data: prevState.data,
          error: isCancelled ? 'Generation was cancelled by the user.' : `Generation failed. ${errorMessage}`
      }));
       setGenerationLog(prev => prev.map(l => l.status === 'loading' ? {...l, status: 'error', details: errorMessage} : l));
    }
  }, [projectData, isGeneratingAnything, addAiLogEntry, handleGenerateChapters, handleGenerateEditingTimeline, handleSettingChange]);

  const handleSuggestTopics = React.useCallback(async () => {
    setSuggestionState({ status: 'loading', data: [], error: null });
    try {
      const suggestions = await generateTopicSuggestions(projectData.language, projectData.generationModel, addAiLogEntry);
      setSuggestionState({ status: 'success', data: suggestions, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching suggestions.';
      setSuggestionState({ status: 'error', data: [], error: errorMessage });
    }
  }, [projectData.language, projectData.generationModel, addAiLogEntry]);

  const handleSuggestStyle = React.useCallback(async () => {
    setStyleSuggestionState({ status: 'loading', data: null, error: null });
    try {
      const suggestion = await generateStyleSuggestion(
        projectData.topic, 
        projectData.styleSuggestionGuide ?? '', 
        projectData.generationModel, 
        addAiLogEntry
      );
      setStyleSuggestionState({ status: 'success', data: suggestion, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while suggesting a style.';
      setStyleSuggestionState({ status: 'error', data: null, error: errorMessage });
    }
  }, [projectData.topic, projectData.styleSuggestionGuide, projectData.generationModel, addAiLogEntry]);

  const handleApplyStyleSuggestion = React.useCallback((suggestion: StyleSuggestion) => {
    setProjectData(prev => ({
        ...prev,
        scriptStyle: suggestion.scriptStyle,
        creativeAngle: suggestion.creativeAngle,
        storyFocus: suggestion.storyFocus,
        welcomeStyle: suggestion.welcomeStyle,
        brandNewScriptStyle: undefined,
        brandNewCreativeAngle: undefined,
        brandNewWelcomeStyle: undefined,
    }));
    setStyleSuggestionState({ status: 'idle', data: null, error: null });
  }, []);

  const handleSuggestBrandNewStyle = React.useCallback(async () => {
    setBrandNewStyleState({ status: 'loading', data: null, error: null });
    try {
      const suggestion = await generateBrandNewStyle(
        projectData.topic, 
        projectData.styleSuggestionGuide ?? '', 
        projectData.generationModel, 
        addAiLogEntry
      );
      setBrandNewStyleState({ status: 'success', data: suggestion, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while suggesting a brand new style.';
      setBrandNewStyleState({ status: 'error', data: null, error: errorMessage });
    }
  }, [projectData.topic, projectData.styleSuggestionGuide, projectData.generationModel, addAiLogEntry]);

    const handleApplyBrandNewStyle = React.useCallback((suggestion: BrandNewStyleSuggestion) => {
        const scriptStyleOption: CustomStyleOption = { id: `ai-script-${Date.now()}`, title: suggestion.scriptStyleName, description: suggestion.scriptStyleDescription };
        const creativeAngleOption: CustomStyleOption = { id: `ai-angle-${Date.now()}`, title: suggestion.creativeAngleName, description: suggestion.creativeAngleDescription };
        const welcomeStyleOption: CustomStyleOption = { id: `ai-welcome-${Date.now()}`, title: suggestion.welcomeStyleName, description: suggestion.welcomeStyleDescription };
        
        setProjectData(prev => ({
            ...prev,
            scriptStyle: scriptStyleOption.id,
            creativeAngle: creativeAngleOption.id,
            welcomeStyle: welcomeStyleOption.id,
            storyFocus: suggestion.storyFocus,
            brandNewScriptStyle: scriptStyleOption,
            brandNewCreativeAngle: creativeAngleOption,
            brandNewWelcomeStyle: welcomeStyleOption,
        }));
        
        setBrandNewStyleState({ status: 'idle', data: null, error: null });
    }, []);


  const handleSuggestionClick = (suggestion: string) => {
    handleSettingChange('topic', suggestion);
    setSuggestionState(initialSuggestionState);
  };

  const handleExport = React.useCallback(async () => {
    if (generationState.status !== 'success' || !generationState.data || !projectData.topic) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const dataToExport: ProjectData = { ...projectData, generatedContent: generationState.data };
      await exportToDocx(dataToExport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during export.';
      setExportError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [generationState.data, generationState.status, projectData]);

  const handleExportHtml = React.useCallback(() => {
    if (generationState.status !== 'success' || !generationState.data || !projectData.topic) return;
    setIsExportingHtml(true);
    setHtmlExportError(null);
    try {
        const dataToExport: ProjectData = { ...projectData, generatedContent: generationState.data };
        exportToHtml(dataToExport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during HTML export.';
      setHtmlExportError(errorMessage);
    } finally {
      setIsExportingHtml(false);
    }
  }, [generationState.data, generationState.status, projectData]);


  const handleExtendStory = React.useCallback(async () => {
    if (generationState.status !== 'success' || !generationState.data) return;
    cancelGenerationRef.current = false;
    setExtensionState({ status: 'loading', data: null, error: null });
    try {
      const { newScriptText } = await extendStory(generationState.data.fullScript!, generationState.data.characters, projectData.topic, projectData.storyBrief, projectData.generationMode, projectData.generationModel, projectData.scriptStyle, projectData.creativeAngle, projectData.language, addAiLogEntry, projectData.contentTone);
      
      if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

      setGenerationState(prevState => {
          if (!prevState.data) return prevState;
          
          const currentFullScript = prevState.data.fullScript || prevState.data.script.join('\n\n');
          const newFullScript = currentFullScript + '\n\n' + newScriptText;
          
          return {
              ...prevState,
              data: {
                  ...prevState.data,
                  fullScript: newFullScript,
              }
          }
      });
      setExtensionState({ status: 'success', data: null, error: null });
    } catch (err) {
      const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setExtensionState({ status: 'error', data: null, error: isCancelled ? 'Extension was cancelled.' : errorMessage });
    }
  }, [generationState.status, generationState.data, projectData, addAiLogEntry]);

  const handleEndStory = React.useCallback(async () => {
      if (generationState.status !== 'success' || !generationState.data) return;
      
      cancelGenerationRef.current = false;
      setEndingState({ status: 'loading', data: null, error: null });
      try {
        const finalText = await endStory(generationState.data.fullScript!, generationState.data.characters, projectData.topic, projectData.storyBrief, projectData.channelName, projectData.useSimpleWords, projectData.useDailyLanguage, projectData.generationMode, projectData.generationModel, projectData.scriptStyle, projectData.creativeAngle, projectData.language, addAiLogEntry, projectData.contentTone);
        
        if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

        setGenerationState(prevState => {
            if (!prevState.data) return prevState;
            const currentFullScript = prevState.data.fullScript || prevState.data.script.join('\n\n');
            const newFullScript = currentFullScript + '\n\n' + finalText;

            return {
                ...prevState,
                data: {
                    ...prevState.data,
                    fullScript: newFullScript,
                }
            }
        });
        setIsContentExtendable(false);
        setEndingState({ status: 'success', data: null, error: null });
      } catch (err) {
        const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setEndingState({ status: 'error', data: null, error: isCancelled ? 'Ending was cancelled.' : errorMessage });
      }
  }, [generationState.status, generationState.data, projectData, addAiLogEntry]);

  const handleGenerateThumbnailSuggestions = React.useCallback(async () => {
      if (generationState.status !== 'success' || !generationState.data) return;

      cancelGenerationRef.current = false;
      setThumbnailSuggestionState({ status: 'loading', data: null, error: null });
      try {
          const suggestions = await generateThumbnailSuggestions(projectData.topic, generationState.data.summary, generationState.data.period, generationState.data.location, projectData.language, projectData.generationModel, addAiLogEntry, projectData.thumbnailText);
          
          if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
          
          setGenerationState(prevState => ({
              ...prevState,
              data: prevState.data ? { ...prevState.data, thumbnailSuggestions: suggestions } : null,
          }));
          setThumbnailSuggestionState({ status: 'success', data: null, error: null });
      } catch (err) {
          const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setThumbnailSuggestionState({ status: 'error', data: null, error: isCancelled ? 'Suggestion generation was cancelled.' : errorMessage });
      }
  }, [generationState.data, generationState.status, projectData.topic, projectData.language, projectData.generationModel, addAiLogEntry, projectData.thumbnailText]);

    const handleLoadSuggestionInto = React.useCallback(async (suggestion: ThumbnailSuggestion, index: number) => {
        if (layoutGenerationState.status === 'loading') return;

        cancelGenerationRef.current = false;
        setLayoutGenerationState({ status: 'loading', error: null, loadingIndex: index });

        try {
            const layoutData = await generateLayoutFromSuggestion(suggestion, projectData.generationModel, addAiLogEntry);
            if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
            
            setProjectData(prev => ({...prev, thumbnailBuilderElements: layoutData.elements, thumbnailBackground: layoutData.background }));
            setIsThumbnailBuilderOpen(true);
            setLayoutGenerationState({ status: 'success', error: null, loadingIndex: null });

        } catch (err) {
            const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setLayoutGenerationState({ status: 'error', error: isCancelled ? 'Layout generation cancelled.' : errorMessage, loadingIndex: null });
            alert(`Failed to load layout: ${errorMessage}`);
        }
    }, [layoutGenerationState.status, projectData.generationModel, addAiLogEntry]);

  const handleGenerateSSMLForPart = React.useCallback(async (partIndex: number) => {
      if (!generationState.data) return;

      if (generationState.data.ssmlScript?.[partIndex]) {
          return;
      }
      
      cancelGenerationRef.current = false;
      setSsmlGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'loading', error: null }}));
      
      try {
          const scriptPart = generationState.data.script[partIndex];
          const ssmlPart = await generateSSML(scriptPart, projectData.generationMode, projectData.language, projectData.ssmlStyle, projectData.generationModel, addAiLogEntry);
          
          if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
          
          setGenerationState(prev => {
              if (!prev.data) return prev;
              const newSsmlScript = [...(prev.data.ssmlScript || [])];
              newSsmlScript[partIndex] = ssmlPart;
              return {
                  ...prev,
                  data: {
                      ...prev.data,
                      ssmlScript: newSsmlScript,
                  }
              };
          });
          setSsmlGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'success', error: null }}));

      } catch (err) {
          const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setSsmlGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'error', error: isCancelled ? 'SSML generation was cancelled.' : errorMessage }}));
      }
  }, [generationState.data, projectData.generationMode, projectData.language, projectData.ssmlStyle, projectData.generationModel, addAiLogEntry]);

  const handleBulkGenerateSSML = React.useCallback(async () => {
      if (!generationState.data) return;

      setIsBulkGeneratingSSML(true);
      const partsToGenerate = generationState.data.script
          .map((_, index) => index)
          .filter(index => !generationState.data?.ssmlScript?.[index]);

      for (const partIndex of partsToGenerate) {
          if (cancelGenerationRef.current) {
              console.log("Bulk SSML generation cancelled by user.");
              break;
          }
          await handleGenerateSSMLForPart(partIndex);
      }

      setIsBulkGeneratingSSML(false);
  }, [generationState.data, handleGenerateSSMLForPart]);
  
  const handleGenerateCuesAndPromptsForPart = React.useCallback(async (partIndex: number) => {
      if (!generationState.data) return;

      cancelGenerationRef.current = false;
      setPromptGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'loading', error: null }}));
      
      try {
          const { script, summary, characters } = generationState.data;
          const startCueNumber = (generationState.data.scenePrompts || []).slice(0, partIndex).reduce((acc, prompts) => acc + (prompts?.length || 0), 1);

          const result = await generateCuesAndPromptsForPart(
              script[partIndex], summary, characters, startCueNumber, projectData.language, projectData.generationModel, addAiLogEntry
          );
          
          if (cancelGenerationRef.current) throw new Error("Cancelled by user.");
          
          setGenerationState(prev => {
              if (!prev.data) return prev;
              const newScript = [...prev.data.script];
              newScript[partIndex] = result.scriptWithCues;
              
              const newScenePrompts = [...prev.data.scenePrompts];
              newScenePrompts[partIndex] = result.prompts;

              return {
                  ...prev,
                  data: {
                      ...prev.data,
                      script: newScript,
                      scenePrompts: newScenePrompts,
                  }
              };
          });
          setPromptGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'success', error: null }}));

      } catch (err) {
          const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setPromptGenerationStates(prev => ({ ...prev, [partIndex]: { status: 'error', error: isCancelled ? 'Prompt generation was cancelled.' : errorMessage }}));
      }
  }, [generationState.data, projectData.language, projectData.generationModel, addAiLogEntry]);

  const handleGenerateImagePrompts = React.useCallback(async (count: number) => {
      if (!generationState.data) return;

      cancelGenerationRef.current = false;
      setImagePromptState({ status: 'loading', data: [], error: null });

      try {
          const { summary, characters } = generationState.data;
          const newPrompts = await generateImagePrompts(projectData.topic, summary, characters, count, projectData.language, projectData.generationModel, addAiLogEntry);

          if (cancelGenerationRef.current) throw new Error("Cancelled by user.");

          setGenerationState(prev => {
              if (!prev.data) return prev;
              const existingPrompts = new Map<string, TitledPrompt>();
              (prev.data.initialImagePrompts || []).forEach(p => existingPrompts.set(p.prompt, p));
              newPrompts.forEach(p => existingPrompts.set(p.prompt, p));

              return {
                  ...prev,
                  data: {
                      ...prev.data,
                      initialImagePrompts: Array.from(existingPrompts.values()),
                  }
              };
          });
          setImagePromptState({ status: 'success', data: newPrompts, error: null });

      } catch (err) {
          const isCancelled = err instanceof Error && err.message === "Cancelled by user.";
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setImagePromptState({ status: 'error', data: [], error: isCancelled ? 'Prompt generation cancelled.' : errorMessage });
      }

  }, [generationState.data, projectData.topic, projectData.language, projectData.generationModel, addAiLogEntry]);
  
  const handleGenerateImage = React.useCallback(async (prompt: string, title: string) => {
    if (projectData.generatedImages?.[prompt]?.status === 'loading') return;

    setProjectData(prev => ({
        ...prev,
        generatedImages: {
            ...prev.generatedImages,
            [prompt]: {
                ...(prev.generatedImages?.[prompt] || { images: [] }),
                title: prev.generatedImages?.[prompt]?.title || title,
                status: 'loading',
                error: undefined,
            }
        }
    }));

    try {
        const base64DataArray = await generateImage(prompt, projectData.imageGenerationModel, projectData.imageAspectRatio, addAiLogEntry);
        const newImage: ImageGenerationAttempt = {
            id: Date.now().toString(),
            data: base64DataArray[0],
            prompt,
            model: projectData.imageGenerationModel,
        };
        setProjectData(prev => ({
            ...prev,
            generatedImages: {
                ...prev.generatedImages,
                [prompt]: {
                    ...prev.generatedImages?.[prompt],
                    status: 'success',
                    images: [...(prev.generatedImages?.[prompt]?.images || []), newImage],
                    error: undefined,
                }
            }
        }));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setProjectData(prev => ({
            ...prev,
            generatedImages: {
                ...prev.generatedImages,
                [prompt]: {
                    ...(prev.generatedImages?.[prompt] || { images: [] }),
                    status: 'error',
                    error: errorMessage,
                }
            }
        }));
    }
  }, [projectData.generatedImages, projectData.imageGenerationModel, projectData.imageAspectRatio, addAiLogEntry]);

    const handleAdjustImage = React.useCallback(async (chainKey: string, imageToAdjust: ImageGenerationAttempt, adjustmentText: string) => {
        setProjectData(prev => ({
            ...prev,
            generatedImages: {
                ...prev.generatedImages,
                [chainKey]: {
                    ...(prev.generatedImages?.[chainKey] || { images: [] }),
                    status: 'loading',
                    isAdjusting: true,
                }
            }
        }));

        try {
            const { imageBytes } = await editImage(
                imageToAdjust.data,
                'image/png', // All generated images are PNGs
                adjustmentText,
                addAiLogEntry
            );
            
            const newPrompt = `${imageToAdjust.prompt}\n\n-- Adjustment: "${adjustmentText}"`;

            const newImage: ImageGenerationAttempt = {
                id: Date.now().toString(),
                data: imageBytes,
                prompt: newPrompt,
                model: 'gemini-2.5-flash-image-preview',
            };

            setProjectData(prev => ({
                ...prev,
                generatedImages: {
                    ...prev.generatedImages,
                    [chainKey]: {
                        ...(prev.generatedImages?.[chainKey] || { images: [] }),
                        status: 'success',
                        isAdjusting: false,
                        images: [...(prev.generatedImages?.[chainKey]?.images || []), newImage],
                    }
                }
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setProjectData(prev => ({
                ...prev,
                generatedImages: {
                    ...prev.generatedImages,
                    [chainKey]: {
                        ...(prev.generatedImages?.[chainKey] || { images: [] }),
                        status: 'error',
                        isAdjusting: false,
                        error: errorMessage,
                    }
                }
            }));
        }
    }, [addAiLogEntry]);

    const handleBulkGenerateImages = React.useCallback(async () => {
        const scenePrompts = (generationState.data?.scenePrompts ?? [])
            .filter((p): p is TitledPrompt[] => Array.isArray(p))
            .flat();

        if (scenePrompts.length === 0) return;

        cancelGenerationRef.current = false;
        setIsBulkGeneratingImages(true);

        try {
            for (const prompt of scenePrompts) {
                if (cancelGenerationRef.current) {
                    console.log("Bulk image generation cancelled by user.");
                    break;
                }
                // Only generate if no image exists for this prompt yet to avoid re-generating
                const imageState = projectData.generatedImages?.[prompt.prompt];
                if (!imageState || imageState.images.length === 0) {
                     await handleGenerateImage(prompt.prompt, prompt.title);
                }
            }
        } catch (err) {
            console.error("An error occurred during bulk image generation:", err);
            // We could set an error state here to show in the UI
        } finally {
            setIsBulkGeneratingImages(false);
        }
    }, [generationState.data?.scenePrompts, projectData.generatedImages, handleGenerateImage]);


    const handleSaveProject = React.useCallback(() => {
        const dataToSave: ProjectData = {
            ...projectData,
            generatedContent: generationState.data
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const safeTopic = projectData.topic.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'project';
        saveAs(blob, `${safeTopic}.json`);
    }, [projectData, generationState.data]);

    const handleLoadProject = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedData = JSON.parse(event.target?.result as string);
                    const sanitizedData = sanitizeProjectData(loadedData);

                    setProjectData(sanitizedData);

                    if (sanitizedData.generatedContent) {
                        setGenerationState({
                            status: 'success',
                            data: sanitizedData.generatedContent,
                            error: null,
                        });
                        setIsContentExtendable(sanitizedData.useExtendedGeneration && !sanitizedData.useChapterDrivenGeneration);
                    } else {
                        setGenerationState(initialGenerationState);
                        setIsContentExtendable(false);
                    }
                    setSuggestionState(initialSuggestionState);
                    setExtensionState(initialActionState);
                    setEndingState(initialActionState);
                    setThumbnailSuggestionState(initialActionState);
                    setSsmlGenerationStates({});
                    setPromptGenerationStates({});

                } catch (err) {
                    console.error("Failed to load or parse project file:", err);
                    alert("Error: The selected file could not be read. It might be corrupted or not a valid project file.");
                }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    }, []);

    const handleLaunchThumbnailBuilderFromScratch = () => {
        handleSettingChange('thumbnailBuilderElements', []);
        handleSettingChange('thumbnailBackground', '');
        setIsThumbnailBuilderOpen(true);
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allScenePrompts = React.useMemo(() => {
    return (generationState.data?.scenePrompts ?? []).filter((p): p is TitledPrompt[] => Array.isArray(p)).flat();
  }, [generationState.data?.scenePrompts]);

  const gridTemplateColumns = React.useMemo(() => {
    const left = isLeftPanelCollapsed ? '48px' : '512px';
    const right = isRightPanelCollapsed ? '48px' : '512px';
    return `${left} 1fr ${right}`;
  }, [isLeftPanelCollapsed, isRightPanelCollapsed]);

  return (
    <div className={`h-screen w-full bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans grid overflow-hidden transition-all duration-300`} style={{ gridTemplateColumns }}>
        {/* Left Panel */}
        <div className={`relative flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isLeftPanelCollapsed ? 'p-2 items-center' : 'p-6'}`}>
            <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} className="absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 p-1 bg-gray-200 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800 text-gray-600 dark:text-gray-300 rounded-full border-2 border-white dark:border-gray-900">
                <ChevronDoubleLeftIcon className={`w-4 h-4 transition-transform ${isLeftPanelCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex-grow w-full transition-opacity overflow-hidden min-h-0 ${isLeftPanelCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                {!isLeftPanelCollapsed && (
                    <MemoizedGeneratorForm
                        apiKey={apiKey} onApiKeyChange={handleApiKeyChange} apiKeyStatus={apiKeyStatus} onTestApiKey={handleTestApiKey} apiKeyTestMessage={apiKeyTestMessage}
                        useManualKeyForImagesOnly={useManualKeyForImagesOnly} onUseManualKeyForImagesOnlyChange={setUseManualKeyForImagesOnly} hasDefaultKey={hasDefaultKey}
                        settings={projectData}
                        onSettingChange={handleSettingChange}
                        isGenerating={isGeneratingAnything} onGenerate={() => handleGenerate()} onInterrupt={handleInterrupt} 
                        isSuggesting={suggestionState.status === 'loading'} onSuggestTopics={handleSuggestTopics}
                        suggestionError={suggestionState.error} topicSuggestions={suggestionState.data || []} onSuggestionClick={handleSuggestionClick} 
                        
                        styleSuggestionState={styleSuggestionState}
                        onSuggestStyle={handleSuggestStyle}
                        onApplyStyleSuggestion={handleApplyStyleSuggestion}

                        brandNewStyleState={brandNewStyleState}
                        onSuggestBrandNewStyle={handleSuggestBrandNewStyle}
                        onApplyBrandNewStyle={handleApplyBrandNewStyle}
                        
                        onViewPrompt={() => setIsLogVisible(true)}
                        onApplyPreset={handleApplyPreset}
                        selectedPreset={selectedPreset}
                    />
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">YouTube Audiobook Script Generator</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        disabled={!generationState.data}
                        className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${isEditMode ? 'bg-purple-200 dark:bg-purple-800 text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                        title="Toggle Edit Mode"
                    >
                        <PaintBrushIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => handleGenerate()} 
                        disabled={isGeneratingAnything || !projectData.topic.trim()} 
                        className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-950"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>{isGeneratingAnything ? 'Generating...' : 'Generate Project'}</span>
                    </button>
            
                    {generationState.data && (
                        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <button onClick={() => setIsGalleryOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Image Gallery"><PhotoIcon className="w-5 h-5"/></button>
                            <button onClick={() => setIsDetailsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="View All Details"><DocumentTextIcon className="w-5 h-5"/></button>
                            <button onClick={handleExport} disabled={isExporting} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title={isExporting ? 'Exporting...' : 'Export to .docx'}><WordIcon className="w-5 h-5"/></button>
                            <button onClick={handleExportHtml} disabled={isExportingHtml} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title={isExportingHtml ? 'Exporting...' : 'Export to .html'}><HtmlIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                      <input type="file" ref={fileInputRef} onChange={handleLoadProject} accept=".json" style={{ display: 'none' }} />
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Load Project"><LoadIcon className="w-5 h-5"/></button>
                      <button onClick={handleSaveProject} disabled={!generationState.data} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50" title="Save Project"><SaveIcon className="w-5 h-5"/></button>
                    </div>
            
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                        <button onClick={() => setIsWhatsNewModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="What's New?"><GiftIcon className="w-5 h-5"/></button>
                        <button onClick={() => setIsUserGuideModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="User Guide"><QuestionMarkCircleIcon className="w-5 h-5"/></button>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Toggle Theme">{theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}</button>
                    </div>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto p-6 bg-grid-pattern">
                {generationState.data && (
                    <header className="mb-6">
                        {isEditMode ? (
                            <textarea
                                value={projectData.topic}
                                onChange={(e) => handleSettingChange('topic', e.target.value)}
                                className="w-full text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight bg-white/10 border-2 border-dashed border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-2 resize-none"
                                rows={1}
                                onInput={(e) => {
                                    const target = e.currentTarget;
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                            />
                        ) : (
                            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                                {projectData.topic}
                            </h2>
                        )}
                        <GeneratedSettingsDisplay settings={projectData} />
                    </header>
                )}
                <MemoizedResultDisplay
                    topic={projectData.topic}
                    content={generationState.data}
                    generationStatus={generationState.status}
                    error={generationState.error}
                    onRemake={() => handleGenerate(true)}
                    generationLog={generationLog}
                    generationSettings={projectData}
                    isGenerating={isGeneratingAnything}
                    onGenerateThumbnailSuggestions={handleGenerateThumbnailSuggestions}
                    isGeneratingThumbnailSuggestions={thumbnailSuggestionState.status === 'loading'}
                    thumbnailSuggestionError={thumbnailSuggestionState.error}
                    onLaunchThumbnailBuilder={() => setIsThumbnailBuilderOpen(true)}
                    onLaunchThumbnailBuilderFromScratch={handleLaunchThumbnailBuilderFromScratch}
                    onLoadSuggestion={handleLoadSuggestionInto}
                    layoutGenerationState={layoutGenerationState}
                    styles={customizedStyles}
                    recommendedStyles={projectData.recommendedStyles ?? []}
                    recommendationsReady={(projectData.recommendedStyles ?? []).length > 0}
                    onGenerateImagePrompts={handleGenerateImagePrompts}
                    isGeneratingImagePrompts={imagePromptState.status === 'loading'}
                    imagePromptsError={imagePromptState.error}
                    generatedImagePrompts={generationState.data?.initialImagePrompts || []}
                    allScenePrompts={allScenePrompts}
                    onGenerateSSMLForPart={handleGenerateSSMLForPart}
                    ssmlGenerationStates={ssmlGenerationStates}
                    onBulkGenerateSSML={handleBulkGenerateSSML}
                    isBulkGeneratingSSML={isBulkGeneratingSSML}
                    directorMode={projectData.directorMode}
                    onGenerateCuesAndPromptsForPart={handleGenerateCuesAndPromptsForPart}
                    promptGenerationStates={promptGenerationStates}
                    generatedImages={projectData.generatedImages ?? {}}
                    onGenerateImage={handleGenerateImage}
                    onAdjustImage={handleAdjustImage}
                    onGenerateChapters={() => handleGenerateChapters()}
                    chaptersError={chaptersState.error}
                    isGeneratingChapters={chaptersState.status === 'loading'}
                    onRemakeChapters={() => handleGenerateChapters()}
                    onGenerateEditingTimeline={() => handleGenerateEditingTimeline()}
                    timelineError={timelineState.error}
                    isGeneratingTimeline={timelineState.status === 'loading'}
                    onRemakeEditingTimeline={() => handleGenerateEditingTimeline()}
                    isEditMode={isEditMode}
                    onContentUpdate={handleContentUpdate}
                    onDeepContentUpdate={handleDeepContentUpdate}
                    currentSettings={projectData}
                    onBulkGenerateImages={handleBulkGenerateImages}
                    isBulkGeneratingImages={isBulkGeneratingImages}
                />
            </main>
        </div>

        {/* Right Panel */}
        <div className={`relative flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 ${isRightPanelCollapsed ? 'p-2' : 'p-6'}`}>
            <button onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)} className="absolute top-1/2 -left-3.5 -translate-y-1/2 z-10 p-1 bg-gray-200 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800 text-gray-600 dark:text-gray-300 rounded-full border-2 border-white dark:border-gray-900">
                <ChevronDoubleRightIcon className={`w-4 h-4 transition-transform ${isRightPanelCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex-grow w-full overflow-hidden transition-opacity ${isRightPanelCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                {!isRightPanelCollapsed && (
                     <div className="flex flex-col h-full">
                        <div className="flex-shrink-0 flex items-center gap-2 text-lg font-bold mb-4">
                            <PaintBrushIcon className="w-6 h-6 text-purple-500" />
                            <h3>Image Style Library</h3>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ImageStyleLibrary
                                styles={customizedStyles}
                                recommendedStyles={projectData.recommendedStyles ?? []}
                                recommendationsReady={(projectData.recommendedStyles ?? []).length > 0}
                                onUpdatePrompt={handleUpdateStylePrompt}
                                onResetPrompt={handleResetStylePrompt}
                            />
                        </div>
                         {projectData.useExtendedGeneration && !projectData.useChapterDrivenGeneration && (
                         <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                            <h3 className="text-lg font-bold mb-2">Story Controls</h3>
                             <button onClick={handleExtendStory} disabled={extensionState.status === 'loading' || !isContentExtendable} className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                                {extensionState.status === 'loading' ? 'Extending...' : 'Extend Story'}
                            </button>
                            {extensionState.error && <p className="text-xs text-red-500">{extensionState.error}</p>}
                            <button onClick={handleEndStory} disabled={endingState.status === 'loading' || !isContentExtendable} className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                                {endingState.status === 'loading' ? 'Finishing...' : 'End Story'}
                            </button>
                             {endingState.error && <p className="text-xs text-red-500">{endingState.error}</p>}
                             {isGeneratingAnything && <button onClick={handleInterrupt} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-200 rounded-lg hover:bg-red-300"><StopCircleIcon className="w-5 h-5" /><span>Stop Generation</span></button>}
                        </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Modals & Overlays */}
        <ZoomControl zoomLevel={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />
        <AILogViewer logs={aiLogs} isVisible={isLogVisible} onToggle={() => setIsLogVisible(!isLogVisible)} onClear={handleClearLogs} />
        <PromptModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} prompt={null} />
        <WhatsNewModal isOpen={isWhatsNewModalOpen} onClose={() => setIsWhatsNewModalOpen(false)} />
        <UserGuideModal isOpen={isUserGuideModalOpen} onClose={() => setIsUserGuideModalOpen(false)} />
        <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} content={generationState.data} generatedImagePrompts={generationState.data?.initialImagePrompts || []} />
        <ImageGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} generatedImages={projectData.generatedImages ?? {}} />
        <ThumbnailBuilderModal
            isOpen={isThumbnailBuilderOpen}
            onClose={() => setIsThumbnailBuilderOpen(false)}
            onSave={(elements, background) => {
                handleSettingChange('thumbnailBuilderElements', elements);
                handleSettingChange('thumbnailBackground', background);
            }}
            onPromptGenerated={(prompt) => {
                console.log("Generated prompt to use:", prompt);
                setIsThumbnailBuilderOpen(false);
            }}
            initialElements={projectData.thumbnailBuilderElements ?? []}
            initialBackground={projectData.thumbnailBackground ?? ''}
            generationModel={projectData.generationModel}
            addAiLogEntry={addAiLogEntry}
        />
    </div>
  );
};