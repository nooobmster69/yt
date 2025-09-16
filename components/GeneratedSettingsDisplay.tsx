import React from 'react';
import type { ProjectData } from '../types';
import { supportedLanguages } from '../types';
import { ChevronDownIcon, Cog6ToothIcon, UserGroupIcon } from './icons';

const SettingPill = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-700/60 rounded-full">
        <span className="font-bold opacity-70">{label}:</span>
        <span className="capitalize">{String(value)}</span>
    </div>
);

const formatDuration = (totalMinutes: number | undefined): string => {
    if (totalMinutes === undefined) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
};


export const GeneratedSettingsDisplay = ({ settings }: { settings: Partial<ProjectData> | null }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!settings) return null;

    const narrativeSettings = [
        { label: 'Script Style', value: settings.scriptStyle?.replace(/-/g, ' ') },
        { label: 'Welcome Style', value: (['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle || '')) ? settings.welcomeStyle?.replace(/-/g, ' ') : undefined },
        { label: 'Story Focus', value: settings.storyFocus },
        { label: 'Creative Angle', value: settings.creativeAngle?.replace(/-/g, ' ') },
        { label: 'Tone', value: settings.contentTone },
        { label: 'Language', value: settings.language ? supportedLanguages[settings.language].name : undefined },
    ].filter(p => p.value);

    const engineSettings = [
        { label: 'Model', value: settings.generationModel },
        { label: 'Workflow', value: settings.useChapterDrivenGeneration ? 'Chapter-Driven' : (settings.useExtendedGeneration ? 'Extended' : 'Single Call') },
        { label: 'Google Search', value: settings.useGoogleSearch ? 'On' : 'Off' },
        { label: 'Director Mode', value: settings.directorMode ? 'On' : 'Off' },
        { label: 'Duration', value: formatDuration(settings.totalDurationMinutes) },
        { label: 'Generation Mode', value: settings.generationMode },
        { label: 'Auto Chapters', value: settings.autoGenerateChapters ? 'On' : 'Off' },
        { label: 'Auto Timeline', value: settings.autoGenerateEditingTimeline ? 'On' : 'Off' },
    ].filter(p => p.value !== undefined && p.value !== '');


    return (
        <div className="mt-4 border border-gray-200 dark:border-gray-700/80 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-gray-600 dark:text-gray-300">View Generation Settings</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700/80 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><UserGroupIcon className="w-5 h-5 text-purple-500"/> Narrative</h4>
                            <div className="flex flex-wrap gap-2">
                                {narrativeSettings.map(s => <SettingPill key={s.label} label={s.label} value={s.value} />)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Cog6ToothIcon className="w-5 h-5 text-purple-500"/> Engine</h4>
                            <div className="flex flex-wrap gap-2">
                                {engineSettings.map(s => <SettingPill key={s.label} label={s.label} value={s.value} />)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};