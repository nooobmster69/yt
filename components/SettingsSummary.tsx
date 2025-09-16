import * as React from 'react';
import type { ProjectData } from '../types';
import { supportedLanguages } from '../types';

interface SettingsSummaryProps {
    settings: Partial<ProjectData> | null;
}

const formatDuration = (totalMinutes: number | undefined): string => {
    if (totalMinutes === undefined) return '';
    if (totalMinutes < 60) {
        return `${totalMinutes}m`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
};

export const SettingsSummary = ({ settings }: SettingsSummaryProps) => {
    if (!settings) {
        return null;
    }

    const settingsPills = [
        { label: 'Topic', value: settings.topic },
        { label: 'Model', value: settings.generationModel?.replace('gemini-2.5-', '') },
        { label: 'Style', value: settings.scriptStyle },
        { label: 'Welcome', value: settings.welcomeStyle && ['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle || '') ? settings.welcomeStyle.replace(/-/g, ' ') : undefined },
        { label: 'Tone', value: settings.contentTone },
        { label: 'Duration', value: formatDuration(settings.totalDurationMinutes) },
        { label: 'Mode', value: settings.useExtendedGeneration ? 'Extended' : (settings.useChapterDrivenGeneration ? 'Chapter-Driven' : 'Single Call') },
        { label: 'Language', value: settings.language ? supportedLanguages[settings.language].name : '' },
        { label: 'Focus', value: settings.storyFocus },
    ].filter(p => p.value);

    return (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-800">
            {settingsPills.map(pill => (
                <div key={pill.label} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700/60 rounded-full">
                    <span className="font-bold opacity-70">{pill.label}:</span>
                    <span className="capitalize">{pill.value}</span>
                </div>
            ))}
        </div>
    );
};