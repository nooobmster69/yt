import { SettingsSummary } from "./components/SettingsSummary";
import { splitScriptIntoChunks, WPM } from './services/utils';

export type ScriptStyle = 'narrative' | 'creative-story' | 'documentary' | 'podcast' | 'single-podcast' | 'investigative' | 'saga' | 'youtuber-explainer' | 'cosmic-odyssey' | 'future-frontier' | 'wonders-of-discovery' | 'pulse-of-life' | 'timeless-tales' | 'enchanted-realms' | 'mind-matters' | 'ancient-earth-chronicles' | string;
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'hi' | 'ar' | 'id' | 'th' | 'km';
export type SSMLStyle = 'standard' | 'storyteller' | 'podcast' | 'announcer';
export type WelcomeStyle = 'calm' | 'energetic' | 'mystery' | 'scholarly' | 'direct-to-camera' | 'weird-history' | string;
export type CreativeAngle = 'standard' | 'fun' | 'plot-twist' | 'outsmart' | string;
export type ImageGenerationModel = 'imagen-4.0-generate-001' | 'imagen-3.0-generate-002' | 'gemini-2.5-flash-image-preview';
export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const supportedLanguages: Record<LanguageCode, { name: string, ssmlCode: string }> = {
    'en': { name: "English", ssmlCode: 'en-US' },
    'es': { name: "Spanish", ssmlCode: 'es-ES' },
    'fr': { name: "French", ssmlCode: 'fr-FR' },
    'de': { name: "German", ssmlCode: 'de-DE' },
    'pt': { name: "Portuguese", ssmlCode: 'pt-BR' },
    'ru': { name: "Russian", ssmlCode: 'ru-RU' },
    'zh': { name: "Chinese (Simplified)", ssmlCode: 'cmn-CN' },
    'ja': { name: "Japanese", ssmlCode: 'ja-JP' },
    'ko': { name: "Korean", ssmlCode: 'ko-KR' },
    'hi': { name: "Hindi", ssmlCode: 'hi-IN' },
    'ar': { name: "Arabic", ssmlCode: 'ar-XA' },
    'id': { name: "Indonesian", ssmlCode: 'id-ID' },
    'th': { name: "Thai", ssmlCode: 'th-TH' },
    'km': { name: "Khmer", ssmlCode: 'km-KH' },
};

export interface TitledPrompt {
  title: string;
  prompt: string;
}

export interface ThumbnailTextOverlay {
    primary: string;
    alternatives: string[];
    fontSuggestion: string;
}

export interface ThumbnailColorAndMood {
    palette: string;
    mood: string;
}

export interface ThumbnailSuggestion {
  concept: string;
  visuals: string;
  textOverlay: ThumbnailTextOverlay;
  colorAndMood: ThumbnailColorAndMood;
  layout: string;
  whyItWorks: string;
}

export interface EditingSuggestion {
  script_cue: string;
  visuals: string;
  text_overlay: string;
  sound_and_music: string;
  rationale: string;
  timestamp: string; // "mm:ss" format
  duration_seconds: number;
}

export interface Chapter {
  timestamp: string; // "mm:ss" format
  title: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GeneratedContent {
  createdAt?: string;
  characters?: string;
  fullScript?: string;
  script: string[];
  summary: string;
  period?: string;
  location?: string;
  thumbnailPrompt: TitledPrompt;
  initialImagePrompts?: TitledPrompt[];
  scenePrompts: (TitledPrompt[] | undefined)[];
  tags: string;
  thumbnailSuggestions?: ThumbnailSuggestion[];
  ssmlScript?: string[];
  editingTimeline?: EditingSuggestion[];
  chapters?: Chapter[];
  groundingChunks?: GroundingChunk[];
  generationProgress?: { chapterTitle: string; status: 'pending' | 'loading' | 'success' | 'error', durationMinutes?: number }[];
  brandNewScriptStyle?: CustomStyleOption;
  brandNewCreativeAngle?: CustomStyleOption;
  brandNewWelcomeStyle?: CustomStyleOption;
}

export type CanvasElement = {
    id: string;
    type: 'text' | 'object';
    x: number; y: number;
    width: number; height: number;
    content: string;
    rotation: number;
    zIndex: number;
    // Text-specific properties
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    lineHeight: number;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    // Stroke
    strokeWidth: number;
    strokeColor: string;
    // Shadow
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    // 3D Text (Extrusion)
    use3dEffect: boolean;
    depth3d: number;
    angle3d: number;
    color3d: string;
    // Gradient
    useGradient: boolean;
    gradientColor1: string;
    gradientColor2: string;
    gradientAngle: number;
    // Object-specific properties
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
};

export type ImageGenerationAttempt = {
    id: string;
    data: string; // base64 string
    prompt: string; // The specific prompt that generated this image
    model: ImageGenerationModel; // The model used to generate this image
};

export type ImageGenerationState = {
    title?: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    isAdjusting?: boolean; // True when loading an adjustment, to show overlay
    images: ImageGenerationAttempt[];
    error?: string;
};

export interface ProjectData {
    createdAt?: string;
    channelName: string;
    topic: string;
    storyBrief?: string;
    styleSuggestionGuide?: string;
    welcomeScriptConcept?: string;
    contentTone?: string;
    storyFocus: 'personal' | 'general';
    scriptStyle: ScriptStyle;
    ssmlStyle: SSMLStyle;
    welcomeStyle: WelcomeStyle;
    mentionChannelNameInWelcome: boolean;
    creativeAngle: CreativeAngle;
    language: LanguageCode;
    useSimpleWords: boolean;
    useDailyLanguage: boolean;
    useExtendedGeneration: boolean;
    useChapterDrivenGeneration: boolean;
    useGoogleSearch: boolean;
    summaryWordCount: number;
    totalDurationMinutes: number;
    partDurationMinutes: number;
    numberOfInitialPrompts: number;
    generationMode: 'quality' | 'speed';
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    imageGenerationModel: ImageGenerationModel;
    imageAspectRatio: ImageAspectRatio;
    directorMode: boolean;
    thumbnailText?: string;
    generatedContent: GeneratedContent | null;
    thumbnailBuilderElements?: CanvasElement[];
    thumbnailBackground?: string;
    recommendedStyles?: string[];
    generatedImagePrompts?: TitledPrompt[];
    autoGenerateChapters: boolean;
    autoGenerateEditingTimeline: boolean;
    generatedImages?: Record<string, ImageGenerationState>;
    brandNewScriptStyle?: CustomStyleOption;
    brandNewCreativeAngle?: CustomStyleOption;
    brandNewWelcomeStyle?: CustomStyleOption;
}

export interface GenerationLogEntry {
  id: number;
  message: string;
  status: 'loading' | 'success' | 'error' | 'pending';
  details?: string;
  durationMinutes?: number;
}

export interface AILogEntry {
  id: number;
  timestamp: string;
  feature: string;
  status: 'requesting' | 'success' | 'error';
  requestData: object;
  responseData: object | null;
  errorData: object | null;
}

export interface PerPartStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export interface ScriptStyleDetail {
  id: ScriptStyle;
  title: string;
  description: string;
}

export interface StyleSuggestion {
  scriptStyle: ScriptStyle;
  creativeAngle: CreativeAngle;
  storyFocus: 'personal' | 'general';
  welcomeStyle: WelcomeStyle;
  rationale: string;
}

export interface BrandNewStyleSuggestion {
  scriptStyleName: string;
  scriptStyleDescription: string;
  creativeAngleName: string;
  creativeAngleDescription: string;
  welcomeStyleName: string;
  welcomeStyleDescription: string;
  storyFocus: 'personal' | 'general';
  rationale: string;
}

export interface CustomStyleOption {
  id: string;
  title: string;
  description: string;
}

export const sanitizeProjectData = (projectData: any): ProjectData => {
    const ensureString = (val: any, fallback = ''): string => (typeof val === 'string' ? val : fallback);
    const ensureNumber = (val: any, fallback: number): number => (typeof val === 'number' && !isNaN(val) ? val : fallback);
    const ensureBoolean = (val: any, fallback: boolean): boolean => (typeof val === 'boolean' ? val : fallback);
    const ensureArray = (val: any, fallback: any[] = []): any[] => (Array.isArray(val) ? val : fallback);
    const ensureObject = (val: any, fallback: object = {}): object => (typeof val === 'object' && val !== null && !Array.isArray(val) ? val : fallback);
    
    // Default values from initialProjectData
    const defaults: Omit<ProjectData, 'generatedContent'> = {
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

    const sanitized: ProjectData = {
        createdAt: ensureString(projectData.createdAt, new Date().toISOString()),
        channelName: ensureString(projectData.channelName, defaults.channelName),
        topic: ensureString(projectData.topic, defaults.topic),
        storyBrief: ensureString(projectData.storyBrief, defaults.storyBrief),
        styleSuggestionGuide: ensureString(projectData.styleSuggestionGuide, defaults.styleSuggestionGuide),
        welcomeScriptConcept: ensureString(projectData.welcomeScriptConcept, defaults.welcomeScriptConcept),
        contentTone: ensureString(projectData.contentTone, defaults.contentTone),
        storyFocus: ['personal', 'general'].includes(projectData.storyFocus) ? projectData.storyFocus : defaults.storyFocus,
        scriptStyle: ensureString(projectData.scriptStyle, defaults.scriptStyle),
        ssmlStyle: ensureString(projectData.ssmlStyle, defaults.ssmlStyle) as SSMLStyle,
        welcomeStyle: ensureString(projectData.welcomeStyle, defaults.welcomeStyle),
        mentionChannelNameInWelcome: ensureBoolean(projectData.mentionChannelNameInWelcome, defaults.mentionChannelNameInWelcome),
        creativeAngle: ensureString(projectData.creativeAngle, defaults.creativeAngle),
        language: ensureString(projectData.language, defaults.language) as LanguageCode,
        useSimpleWords: ensureBoolean(projectData.useSimpleWords, defaults.useSimpleWords),
        useDailyLanguage: ensureBoolean(projectData.useDailyLanguage, defaults.useDailyLanguage),
        useExtendedGeneration: ensureBoolean(projectData.useExtendedGeneration, defaults.useExtendedGeneration),
        useChapterDrivenGeneration: ensureBoolean(projectData.useChapterDrivenGeneration, defaults.useChapterDrivenGeneration),
        useGoogleSearch: ensureBoolean(projectData.useGoogleSearch, defaults.useGoogleSearch),
        summaryWordCount: ensureNumber(projectData.summaryWordCount, defaults.summaryWordCount),
        totalDurationMinutes: ensureNumber(projectData.totalDurationMinutes, defaults.totalDurationMinutes),
        partDurationMinutes: ensureNumber(projectData.partDurationMinutes, defaults.partDurationMinutes),
        numberOfInitialPrompts: ensureNumber(projectData.numberOfInitialPrompts, defaults.numberOfInitialPrompts),
        generationMode: ['quality', 'speed'].includes(projectData.generationMode) ? projectData.generationMode : defaults.generationMode,
        generationModel: ['gemini-2.5-flash', 'gemini-2.5-pro'].includes(projectData.generationModel) ? projectData.generationModel : defaults.generationModel,
        imageGenerationModel: ['imagen-4.0-generate-001', 'imagen-3.0-generate-002', 'gemini-2.5-flash-image-preview'].includes(projectData.imageGenerationModel) ? projectData.imageGenerationModel : defaults.imageGenerationModel,
        imageAspectRatio: ['1:1', '16:9', '9:16', '4:3', '3:4'].includes(projectData.imageAspectRatio) ? projectData.imageAspectRatio : defaults.imageAspectRatio,
        directorMode: ensureBoolean(projectData.directorMode, defaults.directorMode),
        thumbnailText: ensureString(projectData.thumbnailText, defaults.thumbnailText),
        generatedContent: projectData.generatedContent || null,
        thumbnailBuilderElements: ensureArray(projectData.thumbnailBuilderElements),
        thumbnailBackground: ensureString(projectData.thumbnailBackground),
        recommendedStyles: ensureArray(projectData.recommendedStyles),
        generatedImagePrompts: ensureArray(projectData.generatedImagePrompts),
        autoGenerateChapters: ensureBoolean(projectData.autoGenerateChapters, defaults.autoGenerateChapters),
        autoGenerateEditingTimeline: ensureBoolean(projectData.autoGenerateEditingTimeline, defaults.autoGenerateEditingTimeline),
        // FIX: Cast the result of ensureObject to the correct type and pass the default value for consistency.
        generatedImages: ensureObject(projectData.generatedImages, defaults.generatedImages) as Record<string, ImageGenerationState>,
        brandNewScriptStyle: projectData.brandNewScriptStyle ? { id: ensureString(projectData.brandNewScriptStyle.id), title: ensureString(projectData.brandNewScriptStyle.title), description: ensureString(projectData.brandNewScriptStyle.description) } : undefined,
        brandNewCreativeAngle: projectData.brandNewCreativeAngle ? { id: ensureString(projectData.brandNewCreativeAngle.id), title: ensureString(projectData.brandNewCreativeAngle.title), description: ensureString(projectData.brandNewCreativeAngle.description) } : undefined,
        brandNewWelcomeStyle: projectData.brandNewWelcomeStyle ? { id: ensureString(projectData.brandNewWelcomeStyle.id), title: ensureString(projectData.brandNewWelcomeStyle.title), description: ensureString(projectData.brandNewWelcomeStyle.description) } : undefined,
    };
    
    // SPECIAL SANITIZATION
    // When loading a project, if a custom AI style was saved, ensure the main style setting points to its ID.
    if (sanitized.brandNewScriptStyle && !sanitized.scriptStyle.startsWith('ai-')) sanitized.scriptStyle = sanitized.brandNewScriptStyle.id;
    if (sanitized.brandNewCreativeAngle && !sanitized.creativeAngle.startsWith('ai-')) sanitized.creativeAngle = sanitized.brandNewCreativeAngle.id;
    if (sanitized.brandNewWelcomeStyle && !sanitized.welcomeStyle.startsWith('ai-')) sanitized.welcomeStyle = sanitized.brandNewWelcomeStyle.id;
    
    // Fallback for `generatedImages` where title might be missing in older saves.
    if (sanitized.generatedImages) {
        for (const key in sanitized.generatedImages) {
            if (!sanitized.generatedImages[key].title) {
                sanitized.generatedImages[key].title = key;
            }
        }
    }

    return sanitized;
};