import * as React from 'react';
import type { GeneratedContent, EditingSuggestion } from '../types';
import { Loader } from './Loader';
import { SparklesIcon, FilmIcon, ChatBubbleLeftRightIcon, SpeakerWaveIcon, BoltIcon, DocumentTextIcon, ListBulletIcon, Squares2X2Icon, ArrowUturnLeftIcon } from './icons';

interface EditingTimelineViewerProps {
    content: GeneratedContent;
    onGenerate: () => void;
    isGenerating: boolean;
    error: string | null;
    onRemake: () => void;
}

const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};

const secondsToTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = Math.round(seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
};

const TimelineItem = ({ suggestion, isLast }: { suggestion: EditingSuggestion; isLast: boolean }) => {
    return (
        <div className="relative flex items-start">
            <div className="flex-shrink-0 w-12 flex flex-col items-center mr-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300">{suggestion.timestamp}</span>
                </div>
                {!isLast && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>}
            </div>

            <div className="flex-grow bg-gray-50 dark:bg-gray-950/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 mb-8">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 italic">For script starting with: "{suggestion.script_cue}"</p>
                <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Visuals</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.visuals}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Text Overlay</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.text_overlay}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <SpeakerWaveIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Sound & Music</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.sound_and_music}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <BoltIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Rationale</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.rationale}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VisualTimeline = ({ suggestions }: { suggestions: EditingSuggestion[] }) => {
    const totalDuration = React.useMemo(() => {
        if (!suggestions.length) return 1;
        const lastSugg = suggestions[suggestions.length - 1];
        return timeToSeconds(lastSugg.timestamp) + lastSugg.duration_seconds;
    }, [suggestions]);

    const timelineTracks = [
        { type: 'visuals', color: 'bg-blue-500', icon: FilmIcon },
        { type: 'text_overlay', color: 'bg-green-500', icon: ChatBubbleLeftRightIcon },
        { type: 'sound_and_music', color: 'bg-orange-500', icon: SpeakerWaveIcon },
    ];

    const timeMarkers = React.useMemo(() => {
        const markers = [];
        const interval = Math.max(15, Math.ceil(totalDuration / 10 / 15) * 15);
        for (let i = 0; i <= totalDuration; i += interval) {
            markers.push({ time: i, position: (i / totalDuration) * 100 });
        }
        return markers;
    }, [totalDuration]);
    
    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
            <div className="relative mb-2 h-4">
                {timeMarkers.map(marker => (
                    <div key={marker.time} className="absolute top-0 -translate-x-1/2" style={{ left: `${marker.position}%`}}>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{secondsToTime(marker.time)}</span>
                        <div className="h-2 w-px bg-gray-300 dark:bg-gray-600 mx-auto"></div>
                    </div>
                ))}
            </div>
            <div className="relative w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-6"></div>

            <div className="space-y-2">
                {timelineTracks.map(track => (
                    <div key={track.type}>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300"><track.icon className="w-4 h-4" />{track.type.replace(/_/g, ' ')}</h4>
                        <div className="w-full h-8 bg-gray-200 dark:bg-gray-900/50 rounded-md relative overflow-hidden">
                            {suggestions.map((s, index) => {
                                if (!s[track.type as keyof EditingSuggestion] || s[track.type as keyof EditingSuggestion] === 'None') return null;
                                const left = (timeToSeconds(s.timestamp) / totalDuration) * 100;
                                const width = (s.duration_seconds / totalDuration) * 100;
                                return (
                                    <div 
                                        key={index}
                                        className={`absolute h-full ${track.color} opacity-70 hover:opacity-100 transition-opacity rounded group`}
                                        style={{ left: `${left}%`, width: `${width}%` }}
                                        title={s[track.type as keyof EditingSuggestion] as string}
                                    >
                                        <div className="absolute inset-0 p-1.5 text-white text-xs font-semibold whitespace-nowrap overflow-hidden leading-tight">
                                            {s.script_cue}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const EditingTimelineViewer = ({ content, onGenerate, isGenerating, error, onRemake }: EditingTimelineViewerProps) => {
    const [view, setView] = React.useState<'list' | 'timeline'>('list');

    const timelineSuggestions = React.useMemo(() => content.editingTimeline || [], [content.editingTimeline]);

    if (isGenerating && timelineSuggestions.length === 0) {
        return <Loader message="Analyzing script for editing cues..." subMessage="The AI is preparing your video editing timeline." />;
    }

    if (error && timelineSuggestions.length === 0) {
        return (
            <div className="text-center text-red-700 dark:text-red-400 p-4 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg">
              <h4 className="font-bold mb-2">Timeline Generation Failed</h4>
              <p>{error}</p>
            </div>
        );
    }
    
    if (timelineSuggestions.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Video Editor Timeline</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">Generate AI-powered suggestions for your video edit, including when to show specific visuals, add text overlays, and use sound effects.</p>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center mx-auto justify-center gap-3 px-6 py-3 text-base font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <SparklesIcon className="w-6 h-6" />
                    <span>Generate Editing Timeline</span>
                </button>
            </div>
        );
    }
    
    const viewButtonClass = (isActive: boolean) =>
        `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        isActive
            ? 'bg-purple-600 text-white shadow'
            : 'bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50'
        }`;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Editing Timeline</h3>
                    <p className="text-gray-600 dark:text-gray-400">A suggested shot list and editing plan to bring your script to life.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={onRemake} disabled={isGenerating} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-600/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-600/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50">
                        {isGenerating ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div> : <ArrowUturnLeftIcon className="w-4 h-4"/>}
                        <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                    <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-800/80 rounded-lg space-x-1">
                        <button onClick={() => setView('list')} className={viewButtonClass(view === 'list')}>
                            <ListBulletIcon className="w-4 h-4" /> List View
                        </button>
                        <button onClick={() => setView('timeline')} className={viewButtonClass(view === 'timeline')}>
                            <Squares2X2Icon className="w-4 h-4" /> Timeline View
                        </button>
                    </div>
                </div>
            </div>
            {error && <div className="my-2 text-center text-red-700 dark:text-red-400 p-2 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg text-sm"><p>Regeneration failed: {error}</p></div>}
            
            <div className="mt-6">
                {view === 'list' && (
                    <div>
                        {timelineSuggestions.map((suggestion, index) => (
                            <TimelineItem key={index} suggestion={suggestion} isLast={index === timelineSuggestions.length - 1} />
                        ))}
                    </div>
                )}
                {view === 'timeline' && (
                    <VisualTimeline suggestions={timelineSuggestions} />
                )}
            </div>
        </div>
    );
};