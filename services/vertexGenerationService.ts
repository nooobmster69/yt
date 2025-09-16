import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { makeApiCall, getAiClientForTask } from './apiService';
import { 
    constructBaseSystemInstruction, 
    constructMetadataPrompt, 
    constructWelcomePrompt, 
    constructCreativeAngleInstruction,
    CRITICAL_OUTPUT_RULES,
    SEARCH_GUIDELINES,
    ADAPTIVE_WRITING_TECHNIQUES
} from './promptService';
import { cleanGeneratedText, WPM } from './utils';
import type { AILogEntry, BrandNewStyleSuggestion, CreativeAngle, GroundingChunk, ImageAspectRatio, ImageGenerationModel, LanguageCode, ScriptStyle, ScriptStyleDetail, StyleSuggestion, TitledPrompt, WelcomeStyle } from '../types';
import { supportedLanguages } from '../types';

// --- NEW INTERFACE ---
export interface StoryOutline {
    chapters: { title: string; durationMinutes: number }[];
    summary: string;
    period: string;
    location: string;
    characters?: string;
}

export async function* generateYouTubeContent(
    channelName: string, 
    topic: string, 
    storyBrief: string,
    storyFocus: 'personal' | 'general', 
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    useSimpleWords: boolean,
    useDailyLanguage: boolean,
    useExtendedGeneration: boolean,
    useGoogleSearch: boolean,
    totalDurationMinutes: number,
    generationMode: 'quality' | 'speed',
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    language: LanguageCode,
    summaryWordCount: number,
    numberOfInitialPrompts: number,
    welcomeStyle: WelcomeStyle,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    welcomeScriptConcept?: string,
    mentionChannelNameInWelcome?: boolean,
    thumbnailText?: string,
    contentTone?: string
): AsyncGenerator<{ type: 'metadata' | 'scriptChunk' | 'done' | 'groundingChunk', data?: any, chunk?: string, groundingChunks?: GroundingChunk[] }> {
    
    // --- STEP 1: Generate Metadata ---
    const metadataPrompt = constructMetadataPrompt(
        channelName, 
        topic, 
        storyBrief, 
        storyFocus, 
        scriptStyle, 
        creativeAngle, 
        useSimpleWords, 
        useDailyLanguage, 
        useExtendedGeneration, 
        useGoogleSearch, 
        totalDurationMinutes, 
        generationMode, 
        language, 
        summaryWordCount, 
        numberOfInitialPrompts, 
        welcomeStyle, 
        welcomeScriptConcept, 
        mentionChannelNameInWelcome, 
        thumbnailText, 
        contentTone
    );

    const metadataResponse = await makeApiCall(
        'Metadata Generation',
        log,
        async () => {
            const client = getAiClientForTask('text');
            const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const model = `projects/${project}/locations/${location}/publishers/google/models/${generationModel}`;

            const request = {
                endpoint: model,
                instances: [{
                    content: metadataPrompt
                }],
                parameters: {
                    temperature: generationMode === 'speed' ? 0.3 : 0.7,
                    maxOutputTokens: 4000,
                    ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
                }
            };

            const [response] = await client.predict(request);
            return response;
        },
        { prompt: metadataPrompt }
    );

    // Parse metadata response
    const metadataText = metadataResponse?.predictions?.[0]?.content || '';
    const cleanedMetadata = cleanGeneratedText(metadataText);
    
    // Extract metadata from response
    const metadata = {
        title: extractTitle(cleanedMetadata),
        description: extractDescription(cleanedMetadata),
        tags: extractTags(cleanedMetadata),
        thumbnailText: thumbnailText || extractThumbnailText(cleanedMetadata),
        duration: totalDurationMinutes,
        language: language,
        style: scriptStyle,
        creativeAngle: creativeAngle
    };

    yield { type: 'metadata', data: metadata };

    // --- STEP 2: Generate Welcome Script ---
    const welcomePrompt = constructWelcomePrompt(
        channelName,
        topic,
        storyBrief,
        storyFocus,
        scriptStyle,
        creativeAngle,
        useSimpleWords,
        useDailyLanguage,
        useExtendedGeneration,
        useGoogleSearch,
        totalDurationMinutes,
        generationMode,
        language,
        summaryWordCount,
        numberOfInitialPrompts,
        welcomeStyle,
        welcomeScriptConcept,
        mentionChannelNameInWelcome,
        thumbnailText,
        contentTone
    );

    const welcomeResponse = await makeApiCall(
        'Welcome Script Generation',
        log,
        async () => {
            const client = getAiClientForTask('text');
            const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const model = `projects/${project}/locations/${location}/publishers/google/models/${generationModel}`;

            const request = {
                endpoint: model,
                instances: [{
                    content: welcomePrompt
                }],
                parameters: {
                    temperature: generationMode === 'speed' ? 0.3 : 0.7,
                    maxOutputTokens: 2000,
                    ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
                }
            };

            const [response] = await client.predict(request);
            return response;
        },
        { prompt: welcomePrompt }
    );

    const welcomeText = welcomeResponse?.predictions?.[0]?.content || '';
    const cleanedWelcome = cleanGeneratedText(welcomeText);
    
    yield { type: 'scriptChunk', chunk: cleanedWelcome };

    // --- STEP 3: Generate Main Content ---
    const mainContentPrompt = constructMainContentPrompt(
        channelName,
        topic,
        storyBrief,
        storyFocus,
        scriptStyle,
        creativeAngle,
        useSimpleWords,
        useDailyLanguage,
        useExtendedGeneration,
        useGoogleSearch,
        totalDurationMinutes,
        generationMode,
        language,
        summaryWordCount,
        numberOfInitialPrompts,
        welcomeStyle,
        welcomeScriptConcept,
        mentionChannelNameInWelcome,
        thumbnailText,
        contentTone
    );

    const mainContentResponse = await makeApiCall(
        'Main Content Generation',
        log,
        async () => {
            const client = getAiClientForTask('text');
            const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const model = `projects/${project}/locations/${location}/publishers/google/models/${generationModel}`;

            const request = {
                endpoint: model,
                instances: [{
                    content: mainContentPrompt
                }],
                parameters: {
                    temperature: generationMode === 'speed' ? 0.3 : 0.7,
                    maxOutputTokens: 8000,
                    ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
                }
            };

            const [response] = await client.predict(request);
            return response;
        },
        { prompt: mainContentPrompt }
    );

    const mainContentText = mainContentResponse?.predictions?.[0]?.content || '';
    const cleanedMainContent = cleanGeneratedText(mainContentText);
    
    yield { type: 'scriptChunk', chunk: cleanedMainContent };

    // --- STEP 4: Generate Conclusion ---
    const conclusionPrompt = constructConclusionPrompt(
        channelName,
        topic,
        storyBrief,
        storyFocus,
        scriptStyle,
        creativeAngle,
        useSimpleWords,
        useDailyLanguage,
        useExtendedGeneration,
        useGoogleSearch,
        totalDurationMinutes,
        generationMode,
        language,
        summaryWordCount,
        numberOfInitialPrompts,
        welcomeStyle,
        welcomeScriptConcept,
        mentionChannelNameInWelcome,
        thumbnailText,
        contentTone
    );

    const conclusionResponse = await makeApiCall(
        'Conclusion Generation',
        log,
        async () => {
            const client = getAiClientForTask('text');
            const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const model = `projects/${project}/locations/${location}/publishers/google/models/${generationModel}`;

            const request = {
                endpoint: model,
                instances: [{
                    content: conclusionPrompt
                }],
                parameters: {
                    temperature: generationMode === 'speed' ? 0.3 : 0.7,
                    maxOutputTokens: 2000,
                    ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
                }
            };

            const [response] = await client.predict(request);
            return response;
        },
        { prompt: conclusionPrompt }
    );

    const conclusionText = conclusionResponse?.predictions?.[0]?.content || '';
    const cleanedConclusion = cleanGeneratedText(conclusionText);
    
    yield { type: 'scriptChunk', chunk: cleanedConclusion };

    yield { type: 'done' };
}

// Helper functions for extracting metadata
function extractTitle(text: string): string {
    const titleMatch = text.match(/Title:\s*(.+)/i);
    return titleMatch ? titleMatch[1].trim() : 'Generated Title';
}

function extractDescription(text: string): string {
    const descMatch = text.match(/Description:\s*(.+?)(?:\n|$)/is);
    return descMatch ? descMatch[1].trim() : 'Generated Description';
}

function extractTags(text: string): string[] {
    const tagsMatch = text.match(/Tags:\s*(.+)/i);
    if (tagsMatch) {
        return tagsMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return ['audiobook', 'story', 'narrative'];
}

function extractThumbnailText(text: string): string {
    const thumbMatch = text.match(/Thumbnail Text:\s*(.+)/i);
    return thumbMatch ? thumbMatch[1].trim() : 'Generated Thumbnail Text';
}

// Helper functions for constructing prompts
function constructMainContentPrompt(
    channelName: string,
    topic: string,
    storyBrief: string,
    storyFocus: 'personal' | 'general',
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    useSimpleWords: boolean,
    useDailyLanguage: boolean,
    useExtendedGeneration: boolean,
    useGoogleSearch: boolean,
    totalDurationMinutes: number,
    generationMode: 'quality' | 'speed',
    language: LanguageCode,
    summaryWordCount: number,
    numberOfInitialPrompts: number,
    welcomeStyle: WelcomeStyle,
    welcomeScriptConcept?: string,
    mentionChannelNameInWelcome?: boolean,
    thumbnailText?: string,
    contentTone?: string
): string {
    return `Generate the main content for a YouTube audiobook script about: ${topic}

Channel: ${channelName}
Story Brief: ${storyBrief}
Style: ${scriptStyle}
Creative Angle: ${creativeAngle}
Duration: ${totalDurationMinutes} minutes
Language: ${language}

Please create engaging, narrative content that follows the story brief and maintains the specified style and creative angle.`;
}

function constructConclusionPrompt(
    channelName: string,
    topic: string,
    storyBrief: string,
    storyFocus: 'personal' | 'general',
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    useSimpleWords: boolean,
    useDailyLanguage: boolean,
    useExtendedGeneration: boolean,
    useGoogleSearch: boolean,
    totalDurationMinutes: number,
    generationMode: 'quality' | 'speed',
    language: LanguageCode,
    summaryWordCount: number,
    numberOfInitialPrompts: number,
    welcomeStyle: WelcomeStyle,
    welcomeScriptConcept?: string,
    mentionChannelNameInWelcome?: boolean,
    thumbnailText?: string,
    contentTone?: string
): string {
    return `Generate a conclusion for a YouTube audiobook script about: ${topic}

Channel: ${channelName}
Story Brief: ${storyBrief}
Style: ${scriptStyle}
Creative Angle: ${creativeAngle}
Duration: ${totalDurationMinutes} minutes
Language: ${language}

Please create a satisfying conclusion that wraps up the story and encourages engagement.`;
}
