import React from 'react';
import type { ProjectData } from '../types';
import { supportedLanguages } from '../types';
import { SparklesIcon, BookOpenIcon, Cog6ToothIcon, GlobeAltIcon, FilmIcon, UserGroupIcon, ClockIcon, ChatBubbleLeftRightIcon, InspireIcon } from './icons';

const formatDuration = (totalMinutes: number | undefined): string => {
    if (totalMinutes === undefined) return 'N/A';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
};

const SettingItem = ({ label, value, icon }: { label: string, value: React.ReactNode, icon: React.ReactNode }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
            <div className="flex-shrink-0 text-purple-500 dark:text-purple-400 mt-0.5">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 capitalize">{value}</p>
            </div>
        </div>
    );
};

export const SettingsPreview = ({ settings }: { settings: ProjectData }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8 animate-fade-in">
            <SparklesIcon className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Ready to Generate</h2>
            <p className="mt-2 max-w-2xl mb-8">
                Review your current settings below. When you're ready, click "Generate Project" in the header to start creating your script.
            </p>
            <div className="w-full max-w-4xl p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/80 text-left space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3"><InspireIcon className="w-6 h-6 text-purple-500" /> Core Idea</h3>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/40 rounded-xl border border-purple-200 dark:border-purple-800/50">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{settings.topic || <span className="italic opacity-60">Not set</span>}</p>
                        {settings.storyBrief && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Brief: {settings.storyBrief}</p>}
                        {settings.styleSuggestionGuide && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Style Guide: {settings.styleSuggestionGuide}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3"><UserGroupIcon className="w-6 h-6 text-purple-500" /> Narrative Style</h3>
                        <div className="space-y-2">
                             <SettingItem label="Script Style" value={settings.scriptStyle.replace(/-/g, ' ')} icon={<BookOpenIcon className="w-5 h-5"/>} />
                             <SettingItem 
                                label="Welcome Style" 
                                value={
                                    (['narrative', 'single-podcast', 'youtuber-explainer'].includes(settings.scriptStyle) || settings.scriptStyle.startsWith('ai-'))
                                    ? settings.welcomeStyle.replace(/-/g, ' ') 
                                    : <span className="italic opacity-70">Not applicable for this style</span>
                                } 
                                icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} 
                            />
                             <SettingItem label="Story Focus" value={settings.storyFocus} icon={<UserGroupIcon className="w-5 h-5"/>} />
                             <SettingItem label="Creative Angle" value={settings.creativeAngle.replace(/-/g, ' ')} icon={<SparklesIcon className="w-5 h-5"/>} />
                             {settings.contentTone && <SettingItem label="Content Tone" value={settings.contentTone} icon={<SparklesIcon className="w-5 h-5"/>} /> }
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3"><Cog6ToothIcon className="w-6 h-6 text-purple-500" /> Engine & Output</h3>
                         <div className="space-y-2">
                            <SettingItem label="Generation Model" value={settings.generationModel} icon={<Cog6ToothIcon className="w-5 h-5"/>} />
                            <SettingItem label="Language" value={supportedLanguages[settings.language]?.name} icon={<GlobeAltIcon className="w-5 h-5"/>} />
                            <SettingItem label="Total Duration" value={formatDuration(settings.totalDurationMinutes)} icon={<ClockIcon className="w-5 h-5"/>} />
                            <SettingItem label="Workflow" value={settings.useChapterDrivenGeneration ? 'Chapter-Driven' : (settings.useExtendedGeneration ? 'Extended Story' : 'Single Script')} icon={<FilmIcon className="w-5 h-5"/>} />
                            <SettingItem label="Google Search" value={settings.useGoogleSearch ? 'Enabled' : 'Disabled'} icon={<GlobeAltIcon className="w-5 h-5"/>} />
                            <SettingItem label="Director Mode" value={settings.directorMode ? 'Enabled' : 'Disabled'} icon={<FilmIcon className="w-5 h-5"/>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};