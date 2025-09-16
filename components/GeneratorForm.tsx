import React from 'react';
import { InspireIcon, SparklesIcon, DocumentTextIcon, ChevronDownIcon, BookOpenIcon, FilmIcon, ChatBubbleLeftRightIcon, GlobeAltIcon, StopCircleIcon, SpeakerWaveIcon, BeakerIcon, CheckIcon, UserGroupIcon, AdjustmentsHorizontalIcon, Cog6ToothIcon, KeyIcon, BugAntIcon, GiftIcon, BoltIcon, ClockIcon, CloseIcon } from './icons';
import type { ScriptStyle, LanguageCode, SSMLStyle, WelcomeStyle, ImageGenerationModel, ImageAspectRatio, CreativeAngle, ProjectData, ScriptStyleDetail, StyleSuggestion, BrandNewStyleSuggestion, CustomStyleOption } from '../types';
import { supportedLanguages } from '../types';
import { CollapsibleSection } from './CollapsibleSection';

interface Preset {
    name: string;
    description: string;
    settings: Partial<Omit<ProjectData, 'generatedContent'>>;
}

type AsyncState<T> = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
};

interface GeneratorFormProps {
    apiKey: string;
    onApiKeyChange: (value: string) => void;
    apiKeyStatus: 'idle' | 'testing' | 'valid' | 'invalid';
    onTestApiKey: () => void;
    apiKeyTestMessage: string;
    useManualKeyForImagesOnly: boolean;
    onUseManualKeyForImagesOnlyChange: (value: boolean) => void;
    hasDefaultKey: boolean;

    settings: ProjectData;
    onSettingChange: (field: keyof ProjectData, value: any) => void;
    
    isGenerating: boolean;
    onGenerate: () => void;
    onInterrupt: () => void;
    isSuggesting: boolean;
    onSuggestTopics: () => void;
    suggestionError: string | null;
    topicSuggestions: string[];
    onSuggestionClick: (suggestion: string) => void;

    styleSuggestionState: AsyncState<StyleSuggestion>;
    onSuggestStyle: () => void;
    onApplyStyleSuggestion: (suggestion: StyleSuggestion) => void;
    
    brandNewStyleState: AsyncState<BrandNewStyleSuggestion>;
    onSuggestBrandNewStyle: () => void;
    onApplyBrandNewStyle: (suggestion: BrandNewStyleSuggestion) => void;

    onViewPrompt: () => void;
    onApplyPreset: (preset: Preset) => void;
    selectedPreset: string | null;
}

const ToggleSwitch = ({ checked, onChange, disabled, label, description }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled: boolean;
    label: string;
    description: string;
}) => (
    <div className="flex items-center justify-between">
        <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">{label}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            disabled={disabled}
            className={`${
                checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50`}
            role="switch"
            aria-checked={checked}
        >
            <span
                aria-hidden="true"
                className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

const SelectableCard = React.memo(({ option, isSelected, onSelect, isDisabled, icon: Icon, isAI = false }: {
    option: { id: string; title: string; description: string; };
    isSelected: boolean;
    onSelect: (id: string) => void;
    isDisabled: boolean;
    icon: React.FC<{className?: string}>;
    isAI?: boolean;
}) => (
    <button 
        key={option.id} 
        type="button" 
        onClick={() => !isDisabled && onSelect(option.id)} 
        className={`relative flex items-start text-left p-3 rounded-lg border-2 w-full transition-all duration-200 ${
            isSelected
                ? isAI
                    ? 'bg-amber-500 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-purple-600 border-purple-500 shadow-md'
                : isAI
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:border-amber-500'
                    : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800/50 hover:border-purple-400 dark:hover:bg-gray-700/50'
        }`}
    >
        {isAI && (
            <div className="absolute top-1.5 right-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-200 dark:bg-amber-600/50 px-2 py-0.5 rounded-full">
                AI Generated
            </div>
        )}
        <Icon className={`w-6 h-6 mr-3 mt-1 flex-shrink-0 transition-colors ${
            isSelected ? (isAI ? 'text-white' : 'text-white') : (isAI ? 'text-amber-600 dark:text-amber-300' : 'text-purple-600 dark:text-purple-300')
        }`} />
        <div>
            <span className={`font-semibold text-sm transition-colors ${
                isSelected ? 'text-white' : (isAI ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100')
            }`}>{option.title}</span>
            <p className={`text-xs transition-colors ${
                isSelected ? (isAI ? 'text-amber-100' : 'text-purple-200') : (isAI ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400')
            }`}>{option.description}</p>
        </div>
    </button>
));


const scriptStyleOptions: ({ id: ScriptStyle, title: string, description: string, icon: React.FC<{className?: string}> })[] = [
    { id: 'narrative', title: 'Narrative Script', description: 'Immersive, atmospheric script told by a single narrator.', icon: BookOpenIcon },
    { id: 'youtuber-explainer', title: 'YouTuber Explainer', description: 'Conversational, fact-based script like popular history channels.', icon: BoltIcon },
    { id: 'creative-story', title: 'Creative Story', description: 'A complete, novelistic story with rich prose and descriptions.', icon: InspireIcon },
    { id: 'documentary', title: 'Documentary', description: 'Formal, objective, and informative, like a traditional documentary.', icon: FilmIcon },
    { id: 'podcast', title: '2-Host Podcast', description: 'Lively, conversational dialogue between two hosts.', icon: ChatBubbleLeftRightIcon },
    { id: 'single-podcast', title: 'Solo Podcast', description: 'Engaging, direct-to-listener monologue from a single host.', icon: SpeakerWaveIcon },
    { id: 'investigative', title: 'Investigative', description: 'Presents the topic like a mystery to be solved.', icon: DocumentTextIcon },
    { id: 'saga', title: 'Mythic Saga', description: 'Grand, poetic language of an ancient epic.', icon: SparklesIcon },
    { id: 'cosmic-odyssey', title: 'Cosmic Odyssey', description: 'Sweeping, cinematic storytelling for astronomy, space missions, and cosmic mysteries.', icon: GlobeAltIcon },
    { id: 'future-frontier', title: 'Future Frontier', description: 'Energetic, visionary narration for cutting-edge technology and innovations.', icon: BoltIcon },
    { id: 'wonders-of-discovery', title: 'Wonders of Discovery', description: 'Inspiring, approachable storytelling celebrating scientific breakthroughs.', icon: BeakerIcon },
    { id: 'pulse-of-life', title: 'Pulse of Life', description: 'Human-centered storytelling connecting medical science with personal stories.', icon: UserGroupIcon },
    { id: 'timeless-tales', title: 'Timeless Tales', description: 'Traditional storytelling style for folklore or reflective narratives.', icon: BookOpenIcon },
    { id: 'enchanted-realms', title: 'Enchanted Realms', description: 'Rich, imaginative narration for fairy tales, fantasy, and magical journeys.', icon: SparklesIcon },
    { id: 'mind-matters', title: 'Mind Matters', description: 'Gentle, empathetic storytelling about mental well-being and resilience.', icon: InspireIcon },
    { id: 'ancient-earth-chronicles', title: 'Ancient Earth Chronicles', description: 'Vivid, time-travel narration for dinosaurs and prehistoric life.', icon: ClockIcon },
];

const welcomeStyleOptions: { id: WelcomeStyle, title: string, description: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'energetic', title: 'Energetic YouTuber', description: "High-energy, direct, and hook-focused intro.", icon: SparklesIcon },
    { id: 'weird-history', title: 'Weird History Hook', description: "Dramatic cold open followed by a direct call-to-action.", icon: BoltIcon },
    { id: 'calm', title: 'Calm & Immersive', description: "Gentle, atmospheric, and soft intro for relaxing content.", icon: BookOpenIcon },
    { id: 'mystery', title: 'Intriguing Mystery', description: "Starts with a captivating question to pull the viewer in.", icon: BeakerIcon },
    { id: 'scholarly', title: 'Scholarly Lecture', description: "A formal, educational opening for serious topics.", icon: DocumentTextIcon },
    { id: 'direct-to-camera', title: 'Direct to Camera', description: "A personal, authoritative hook speaking directly to the viewer.", icon: UserGroupIcon },
];

const creativeAngleOptions: { id: CreativeAngle, title: string, description: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'standard', title: 'Standard', description: 'A balanced, direct narrative approach.', icon: BookOpenIcon },
    { id: 'fun', title: 'Fun & Witty', description: 'Lighthearted, humorous, and entertaining.', icon: GiftIcon },
    { id: 'plot-twist', title: 'Plot Twist', description: 'Builds to a shocking, perspective-shifting reveal.', icon: BoltIcon },
    { id: 'outsmart', title: 'Outsmart', description: 'Focuses on clever strategies and battles of wits.', icon: BeakerIcon },
];

const formatDuration = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
};

const formatPartDuration = (minutes: number): string => {
    return `${minutes} min${minutes > 1 ? 's' : ''}`;
};


const presets: Preset[] = [
    { 
        name: 'Quick History Short', 
        description: 'A fast, engaging video for a broad audience.',
        settings: { 
            scriptStyle: 'youtuber-explainer',
            totalDurationMinutes: 10,
            partDurationMinutes: 5,
            useChapterDrivenGeneration: true,
            useExtendedGeneration: false,
            storyFocus: 'general',
            welcomeStyle: 'weird-history'
        } 
    },
    { 
        name: 'Deep Dive Science Doc', 
        description: 'High-quality, factual content for in-depth topics.',
        settings: { 
            scriptStyle: 'documentary',
            totalDurationMinutes: 30,
            partDurationMinutes: 7,
            generationModel: 'gemini-2.5-pro',
            useGoogleSearch: true,
            useChapterDrivenGeneration: true,
            useExtendedGeneration: false,
            storyFocus: 'general'
        } 
    },
    { 
        name: 'Creative Fictional Story', 
        description: 'For imaginative narratives and storytelling.',
        settings: {
            scriptStyle: 'creative-story',
            totalDurationMinutes: 20,
            partDurationMinutes: 6,
            useExtendedGeneration: true,
            useChapterDrivenGeneration: false,
            storyFocus: 'personal',
            creativeAngle: 'plot-twist',
            welcomeStyle: 'mystery'
        } 
    },
     { 
        name: 'Solo Podcast Episode', 
        description: 'A conversational, direct-to-listener script.',
        settings: {
            scriptStyle: 'single-podcast',
            totalDurationMinutes: 25,
            partDurationMinutes: 8,
            useChapterDrivenGeneration: true,
            useExtendedGeneration: false,
            storyFocus: 'personal',
            welcomeStyle: 'direct-to-camera'
        } 
    },
    { 
        name: '2-Hour Sleep Story', 
        description: 'A long, calming narrative for relaxation and sleep.',
        settings: { 
            scriptStyle: 'narrative',
            totalDurationMinutes: 120,
            partDurationMinutes: 8,
            useChapterDrivenGeneration: true,
            useExtendedGeneration: false,
            storyFocus: 'personal',
            welcomeStyle: 'calm',
            creativeAngle: 'standard'
        } 
    },
    { 
        name: '3-Hour Deep Sleep Saga', 
        description: 'An epic-length, immersive story for a full night of rest.',
        settings: {
            scriptStyle: 'creative-story',
            totalDurationMinutes: 180,
            partDurationMinutes: 10,
            useChapterDrivenGeneration: true,
            useExtendedGeneration: false,
            storyFocus: 'general',
            welcomeStyle: 'calm',
            creativeAngle: 'standard',
            generationModel: 'gemini-2.5-pro'
        } 
    }
];

export const GeneratorForm = React.memo((props: GeneratorFormProps) => {
    const { settings, onSettingChange } = props;
    const { brandNewScriptStyle, brandNewCreativeAngle, brandNewWelcomeStyle } = settings;

    const inputClasses = "mt-1 block w-full bg-gray-200/50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500";
    const labelClasses = "block text-sm font-semibold text-gray-700 dark:text-gray-300";

    const isGenerateDisabled = props.isGenerating || !(props.apiKeyStatus === 'valid' || props.hasDefaultKey);

    const [activeSection, setActiveSection] = React.useState<string | null>(
        !props.hasDefaultKey ? 'api-key' : 'core-idea'
    );
    
    const handleToggleSection = (sectionId: string) => {
        setActiveSection(prev => (prev === sectionId ? null : sectionId));
    };

    React.useEffect(() => {
        if (settings.generationModel === 'gemini-2.5-pro' && settings.generationMode === 'speed') {
            onSettingChange('generationMode', 'quality');
        }
    }, [settings.generationModel, settings.generationMode, onSettingChange]);

    // Automatically set aspect ratio to 1:1 for nano-banana
    React.useEffect(() => {
        if (settings.imageGenerationModel === 'gemini-2.5-flash-image-preview' && settings.imageAspectRatio !== '1:1') {
            onSettingChange('imageAspectRatio', '1:1');
        }
    }, [settings.imageGenerationModel, settings.imageAspectRatio, onSettingChange]);


    const isSuggestingAnything = props.styleSuggestionState.status === 'loading' || props.brandNewStyleState.status === 'loading';
    const isNanoBanana = settings.imageGenerationModel === 'gemini-2.5-flash-image-preview';

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-grow space-y-4 overflow-y-auto pb-24">
                 <CollapsibleSection 
                    id="api-key" 
                    title="API Key Configuration" 
                    icon={<KeyIcon className="w-6 h-6" />} 
                    isOpen={activeSection === 'api-key'} 
                    onToggle={() => handleToggleSection('api-key')}
                >
                    <div className="space-y-4 text-sm">
                        {props.hasDefaultKey ? (
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200">
                                An API key has been pre-configured for this application. You can optionally provide your own key below to override it.
                            </div>
                        ) : (
                             <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200">
                                No pre-configured API key was found. Please provide your own Gemini API key to enable generation.
                            </div>
                        )}
                         <div>
                            <label htmlFor="apiKey" className={labelClasses}>Your Gemini API Key</label>
                            <div className="mt-1 flex items-stretch gap-2">
                                <input
                                    id="apiKey"
                                    type="password"
                                    value={props.apiKey}
                                    onChange={(e) => props.onApiKeyChange(e.target.value)}
                                    placeholder="Enter your API Key"
                                    className={`${inputClasses} flex-grow`}
                                />
                                <button
                                    onClick={props.onTestApiKey}
                                    disabled={props.apiKeyStatus === 'testing' || !props.apiKey}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex-shrink-0"
                                >
                                    {props.apiKeyStatus === 'testing' ? '...' : 'Test'}
                                </button>
                            </div>
                            {props.apiKeyTestMessage && (
                                <pre className={`mt-2 text-sm whitespace-pre-wrap font-sans ${props.apiKeyStatus === 'valid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {props.apiKeyTestMessage}
                                </pre>
                            )}
                        </div>
                        {props.hasDefaultKey && (
                            <>
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        id="image-only-key"
                                        type="checkbox"
                                        checked={props.useManualKeyForImagesOnly}
                                        onChange={(e) => props.onUseManualKeyForImagesOnlyChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="image-only-key" className="text-gray-700 dark:text-gray-300">
                                        Use this key for Image Generation only
                                    </label>
                                </div>
                                {props.apiKey && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                                        {props.useManualKeyForImagesOnly
                                            ? "Image generation will use your key. Text generation will use the pre-configured key."
                                            : "Both text and image generation will use your key."
                                        }
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection 
                    id="presets" 
                    title="Presets" 
                    icon={<SparklesIcon className="w-6 h-6" />}
                    isOpen={activeSection === 'presets'} 
                    onToggle={() => handleToggleSection('presets')}
                >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quickly configure settings for common video types.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {presets.map(preset => {
                            const isSelected = props.selectedPreset === preset.name;
                            return (
                                <button key={preset.name} type="button" onClick={() => props.onApplyPreset(preset)} disabled={props.isGenerating} className={`p-3 text-left rounded-lg border-2 bg-gray-50 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:bg-gray-700/50 transition-all ${isSelected ? 'border-purple-500 ring-2 ring-purple-400/50' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{preset.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </CollapsibleSection>

                 <CollapsibleSection 
                    id="core-idea" 
                    title="Core Idea" 
                    icon={<InspireIcon className="w-6 h-6" />} 
                    isOpen={activeSection === 'core-idea'} 
                    onToggle={() => handleToggleSection('core-idea')}
                >
                    <div className="space-y-4">
                        {/* Group 1: Story Content */}
                        <div className="p-4 space-y-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">Story Blueprint</h4>
                            <div>
                                <label htmlFor="topic" className={labelClasses}>Video Topic</label>
                                <textarea id="topic" rows={3} value={settings.topic} onChange={(e) => onSettingChange('topic', e.target.value)} disabled={props.isGenerating} placeholder="e.g., The secret life of a Roman legionary" className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="storyBrief" className={labelClasses}>Story Brief (Optional)</label>
                                <textarea id="storyBrief" rows={3} value={settings.storyBrief} onChange={(e) => onSettingChange('storyBrief', e.target.value)} disabled={props.isGenerating} placeholder="e.g., Focus on the daily life of a soldier, the brutal training, the food, the campaigns in Gaul, and end with his retirement." className={inputClasses} />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Provide the AI with specific instructions, key points, or a narrative angle for the story generation.</p>
                            </div>
                        </div>

                        {/* Group 2: AI Suggestions */}
                        <div className="p-4 space-y-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">AI Creative Assistant</h4>
                            <div>
                                <label htmlFor="styleSuggestionGuide" className={labelClasses}>Style Suggestion Guide (Optional)</label>
                                <textarea id="styleSuggestionGuide" rows={2} value={settings.styleSuggestionGuide} onChange={(e) => onSettingChange('styleSuggestionGuide', e.target.value)} disabled={props.isGenerating} placeholder="e.g., A calm history video for sleeping, focus on soft narration." className={inputClasses} />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Guide the "Suggest Style" buttons. Describe the intended audience, tone, or creative direction.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={props.onSuggestStyle} disabled={props.isGenerating || isSuggestingAnything || !settings.topic} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-200 bg-purple-200/60 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 disabled:opacity-50"><SparklesIcon className={`w-5 h-5 ${props.styleSuggestionState.status === 'loading' ? 'animate-pulse' : ''}`} /><span>Suggest from Existing</span></button>
                                <button onClick={props.onSuggestBrandNewStyle} disabled={props.isGenerating || isSuggestingAnything || !settings.topic} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-200 bg-purple-200/60 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 disabled:opacity-50"><BoltIcon className={`w-5 h-5 ${props.brandNewStyleState.status === 'loading' ? 'animate-pulse' : ''}`} /><span>Suggest a *Brand New* Style</span></button>
                            </div>
                            {props.styleSuggestionState.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 animate-pulse">AI is crafting the perfect narrative combination...</p>}
                            {props.styleSuggestionState.error && <p className="text-sm text-red-500 mt-3">{props.styleSuggestionState.error}</p>}
                            {props.styleSuggestionState.data && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg space-y-3 animate-fade-in">
                                    <h4 className="font-bold text-green-800 dark:text-green-200">AI Recommendation</h4>
                                    <p className="text-sm text-green-700 dark:text-green-300"><strong>Rationale:</strong> {props.styleSuggestionState.data.rationale}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p><strong>Script Style:</strong> {props.styleSuggestionState.data.scriptStyle.replace(/-/g, ' ')}</p>
                                        <p><strong>Creative Angle:</strong> {props.styleSuggestionState.data.creativeAngle.replace(/-/g, ' ')}</p>
                                        <p><strong>Story Focus:</strong> {props.styleSuggestionState.data.storyFocus}</p>
                                        <p><strong>Welcome Style:</strong> {props.styleSuggestionState.data.welcomeStyle.replace(/-/g, ' ')}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => props.onApplyStyleSuggestion(props.styleSuggestionState.data!)} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Apply Suggestion</button>
                                        <button onClick={() => props.onSettingChange('topic', props.settings.topic)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 border border-gray-300">Dismiss</button>
                                    </div>
                                </div>
                            )}
                            {props.brandNewStyleState.status === 'loading' && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 animate-pulse">AI is inventing a brand new style for your topic...</p>}
                            {props.brandNewStyleState.error && <p className="text-sm text-red-500 mt-3">{props.brandNewStyleState.error}</p>}
                            {props.brandNewStyleState.data && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg space-y-3 animate-fade-in">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-200">AI-Generated Custom Style</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Rationale:</strong> {props.brandNewStyleState.data.rationale}</p>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Script Style: "{props.brandNewStyleState.data.scriptStyleName}"</strong> - <i className="opacity-80">{props.brandNewStyleState.data.scriptStyleDescription}</i></p>
                                        <p><strong>Creative Angle: "{props.brandNewStyleState.data.creativeAngleName}"</strong> - <i className="opacity-80">{props.brandNewStyleState.data.creativeAngleDescription}</i></p>
                                        <p><strong>Welcome Style: "{props.brandNewStyleState.data.welcomeStyleName}"</strong> - <i className="opacity-80">{props.brandNewStyleState.data.welcomeStyleDescription}</i></p>
                                        <p><strong>Story Focus:</strong> {props.brandNewStyleState.data.storyFocus}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => props.onApplyBrandNewStyle(props.brandNewStyleState.data!)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Apply Custom Style</button>
                                        <button onClick={() => props.onSettingChange('topic', props.settings.topic)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 border border-gray-300">Dismiss</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button onClick={props.onSuggestTopics} disabled={props.isGenerating || props.isSuggesting} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-200 bg-purple-200/60 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 disabled:opacity-50"><InspireIcon className={`w-5 h-5 ${props.isSuggesting ? 'animate-pulse' : ''}`} /><span>{props.isSuggesting ? 'Inspiring...' : 'Inspire Idea'}</span></button>
                            <button type="button" onClick={props.onViewPrompt} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-700/50 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                                <BugAntIcon className="w-5 h-5" />
                                <span>View AI Prompts</span>
                            </button>
                        </div>
                        {(props.isSuggesting || props.suggestionError || props.topicSuggestions.length > 0) && (
                            <div className="mt-3">{props.isSuggesting ? <p className="text-gray-500 text-sm">Loading...</p> : props.suggestionError ? <p className="text-red-500">{props.suggestionError}</p> : <div className="flex flex-wrap gap-2">{props.topicSuggestions.map((s, i) => <button key={i} onClick={() => props.onSuggestionClick(s)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-purple-500 hover:text-white text-sm">{s}</button>)}</div>}</div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="channelName" className={labelClasses}>YouTube Channel Name</label>
                                <input type="text" id="channelName" value={settings.channelName} onChange={(e) => onSettingChange('channelName', e.target.value)} disabled={props.isGenerating} placeholder="e.g., History Uncovered" className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="language" className={labelClasses}>Output Language</label>
                                <div className="relative mt-1">
                                    <select id="language" name="language" value={settings.language} onChange={(e) => onSettingChange('language', e.target.value)} disabled={props.isGenerating} className={`${inputClasses} pl-4 pr-10 appearance-none`}>{Object.entries(supportedLanguages).map(([code, { name }]) => <option key={code} value={code}>{name}</option>)}</select>
                                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                 <CollapsibleSection 
                    id="narrative-style" 
                    title="Narrative Style" 
                    icon={<UserGroupIcon className="w-6 h-6" />}
                    isOpen={activeSection === 'narrative-style'} 
                    onToggle={() => handleToggleSection('narrative-style')}
                >
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Script Style</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {brandNewScriptStyle && (
                                    <div className="col-span-1 sm:col-span-2">
                                        <SelectableCard
                                            option={brandNewScriptStyle}
                                            isSelected={settings.scriptStyle === brandNewScriptStyle.id}
                                            onSelect={(id) => onSettingChange('scriptStyle', id)}
                                            isDisabled={props.isGenerating}
                                            icon={SparklesIcon}
                                            isAI={true}
                                        />
                                    </div>
                                )}
                                {scriptStyleOptions.map(o => (
                                    <SelectableCard
                                        key={o.id}
                                        option={o}
                                        isSelected={settings.scriptStyle === o.id}
                                        onSelect={(id) => onSettingChange('scriptStyle', id)}
                                        isDisabled={props.isGenerating}
                                        icon={o.icon}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Creative Angle</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {brandNewCreativeAngle && (
                                     <div className="col-span-1 sm:col-span-2">
                                        <SelectableCard
                                            option={brandNewCreativeAngle}
                                            isSelected={settings.creativeAngle === brandNewCreativeAngle.id}
                                            onSelect={(id) => onSettingChange('creativeAngle', id)}
                                            isDisabled={props.isGenerating}
                                            icon={SparklesIcon}
                                            isAI={true}
                                        />
                                    </div>
                                )}
                                {creativeAngleOptions.map(o => (
                                    <SelectableCard
                                        key={o.id}
                                        option={o}
                                        isSelected={settings.creativeAngle === o.id}
                                        onSelect={(id) => onSettingChange('creativeAngle', id)}
                                        isDisabled={props.isGenerating}
                                        icon={o.icon}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Story Focus</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">{(['personal', 'general'] as const).map(f => <button key={f} type="button" onClick={() => onSettingChange('storyFocus', f)} disabled={props.isGenerating} className={`p-3 text-left rounded-lg border-2 ${settings.storyFocus === f ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-500' : 'bg-gray-50 dark:bg-gray-800/50 hover:border-purple-400'}`}><p className="font-bold capitalize">{f} Stories</p><p className="text-xs text-gray-500">{f === 'personal' ? 'Focus on key characters' : 'Broad historical overview'}</p></button>)}</div>
                        </div>
                        <div>
                            <label htmlFor="contentTone" className={labelClasses}>Content Tone (Optional)</label>
                            <input type="text" id="contentTone" value={settings.contentTone} onChange={(e) => onSettingChange('contentTone', e.target.value)} disabled={props.isGenerating} placeholder="e.g., 'Health & Wellness', 'Science Documentary'" className={inputClasses} />
                        </div>
                         <div className={!['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle) && !settings.scriptStyle.startsWith('ai-') ? 'opacity-50' : ''}>
                            <label className={labelClasses}>Welcome Style</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {brandNewWelcomeStyle && (
                                    <div className="col-span-1 sm:col-span-2">
                                        <SelectableCard
                                            option={brandNewWelcomeStyle}
                                            isSelected={settings.welcomeStyle === brandNewWelcomeStyle.id}
                                            onSelect={(id) => onSettingChange('welcomeStyle', id)}
                                            isDisabled={props.isGenerating}
                                            icon={SparklesIcon}
                                            isAI={true}
                                        />
                                    </div>
                                )}
                                {welcomeStyleOptions.map(o => (
                                    <SelectableCard
                                        key={o.id}
                                        option={o}
                                        isSelected={settings.welcomeStyle === o.id}
                                        onSelect={(id) => onSettingChange('welcomeStyle', id)}
                                        isDisabled={props.isGenerating || (!['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle) && !settings.scriptStyle.startsWith('ai-'))}
                                        icon={o.icon}
                                    />
                                ))}
                            </div>
                            {!['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle) && !settings.scriptStyle.startsWith('ai-') && <p className="text-xs text-gray-500 mt-2">Welcome Style is only available for Narrative, Solo Podcast, and YouTuber Explainer styles.</p>}
                        </div>
                        <ToggleSwitch
                            checked={settings.mentionChannelNameInWelcome}
                            onChange={(v) => onSettingChange('mentionChannelNameInWelcome', v)}
                            disabled={props.isGenerating}
                            label="Mention Channel Name"
                            description="Include the channel name in the welcome script."
                        />
                    </div>
                 </CollapsibleSection>

                 <CollapsibleSection 
                    id="engine-output" 
                    title="Engine & Output" 
                    icon={<Cog6ToothIcon className="w-6 h-6" />}
                    isOpen={activeSection === 'engine-output'} 
                    onToggle={() => handleToggleSection('engine-output')}
                >
                     <div className="space-y-6">
                         <div>
                            <label className={labelClasses}>Generation Model</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">{(['gemini-2.5-flash', 'gemini-2.5-pro'] as const).map(m => <button key={m} type="button" onClick={() => onSettingChange('generationModel', m)} disabled={props.isGenerating} className={`p-3 text-left rounded-lg border-2 ${settings.generationModel === m ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-500' : 'bg-gray-50 dark:bg-gray-800/50 hover:border-purple-400'}`}><p className="font-bold">{m === 'gemini-2.5-flash' ? '2.5 Flash' : '2.5 Pro'}</p><p className="text-xs text-gray-500">{m === 'gemini-2.5-flash' ? 'Fast & cost-effective' : 'Highest quality'}</p></button>)}</div>
                        </div>
                        <ToggleSwitch checked={settings.useChapterDrivenGeneration} onChange={(v) => onSettingChange('useChapterDrivenGeneration', v)} disabled={props.isGenerating} label="Chapter-Driven Generation" description="AI generates a full chapter outline first for better structure." />
                        <ToggleSwitch checked={settings.useGoogleSearch} onChange={(v) => onSettingChange('useGoogleSearch', v)} disabled={props.isGenerating} label="Use Google Search" description="AI uses Google for factual accuracy on current topics." />
                         <div>
                            <label htmlFor="totalDuration" className={labelClasses}>Total Story Duration: <span className="font-bold text-purple-600 dark:text-purple-300">{formatDuration(settings.totalDurationMinutes)}</span></label>
                            <input id="totalDuration" type="range" min="1" max="450" value={settings.totalDurationMinutes} onChange={(e) => onSettingChange('totalDurationMinutes', Number(e.target.value))} disabled={props.isGenerating} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 accent-purple-500" />
                        </div>
                         <div>
                            <label htmlFor="partDuration" className={labelClasses}>Duration Each Part: <span className="font-bold text-purple-600 dark:text-purple-300">{formatPartDuration(settings.partDurationMinutes)}</span></label>
                            <input id="partDuration" type="range" min="1" max="120" value={settings.partDurationMinutes} onChange={(e) => onSettingChange('partDurationMinutes', Number(e.target.value))} disabled={props.isGenerating} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 accent-purple-500" />
                        </div>
                        <div>
                            <label htmlFor="numberOfInitialPrompts" className={labelClasses}>Number of Initial Image Prompts: <span className="font-bold text-purple-600 dark:text-purple-300">{settings.numberOfInitialPrompts}</span></label>
                            <input id="numberOfInitialPrompts" type="range" min="1" max="200" value={settings.numberOfInitialPrompts} onChange={(e) => onSettingChange('numberOfInitialPrompts', Number(e.target.value))} disabled={props.isGenerating} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 accent-purple-500" />
                        </div>
                        <div>
                            <label htmlFor="imageGenerationModel" className={labelClasses}>Image Generation Model</label>
                            <div className="relative mt-1">
                                <select
                                    id="imageGenerationModel"
                                    value={settings.imageGenerationModel}
                                    onChange={(e) => onSettingChange('imageGenerationModel', e.target.value as ImageGenerationModel)}
                                    disabled={props.isGenerating}
                                    className={`${inputClasses} pl-4 pr-10 appearance-none`}
                                >
                                    <option value="imagen-4.0-generate-001">Imagen 4.0 (Highest Quality)</option>
                                    <option value="imagen-3.0-generate-002">Imagen 3.0</option>
                                    <option value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash Image Preview (Nano-banana)</option>
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nano-banana is optimized for image editing and only generates 1:1 square images.</p>
                        </div>
                        <div>
                            <label htmlFor="imageAspectRatio" className={labelClasses}>Image Aspect Ratio</label>
                            <div className="relative mt-1">
                                <select
                                    id="imageAspectRatio"
                                    value={settings.imageAspectRatio}
                                    onChange={(e) => onSettingChange('imageAspectRatio', e.target.value)}
                                    disabled={props.isGenerating || isNanoBanana}
                                    className={`${inputClasses} pl-4 pr-10 appearance-none ${isNanoBanana ? 'bg-gray-200 dark:bg-gray-700/50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="16:9">16:9 (Widescreen)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="9:16">9:16 (Vertical)</option>
                                    <option value="4:3">4:3 (Standard)</option>
                                    <option value="3:4">3:4 (Portrait)</option>
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <ToggleSwitch checked={settings.directorMode} onChange={(v) => onSettingChange('directorMode', v)} disabled={props.isGenerating} label="Director Mode" description="Automatically insert visual cues and prompts into the script."/>
                        <ToggleSwitch checked={settings.autoGenerateChapters} onChange={(v) => onSettingChange('autoGenerateChapters', v)} disabled={props.isGenerating} label="Auto-Generate Chapters" description="Generate YouTube chapters after the script is complete."/>
                        <ToggleSwitch checked={settings.autoGenerateEditingTimeline} onChange={(v) => onSettingChange('autoGenerateEditingTimeline', v)} disabled={props.isGenerating} label="Auto-Generate Editing Timeline" description="Generate an editing plan after the script is complete."/>
                    </div>
                 </CollapsibleSection>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
                 {props.isGenerating && (
                    <button 
                        onClick={props.onInterrupt} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-200 dark:bg-red-900/50 dark:text-red-300 rounded-lg hover:bg-red-300 dark:hover:bg-red-800/50 transition-colors"
                    >
                        <StopCircleIcon className="w-5 h-5" />
                        <span>Stop Generation</span>
                    </button>
                )}
            </div>
        </div>
    );
});