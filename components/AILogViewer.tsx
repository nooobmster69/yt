import * as React from 'react';
import type { AILogEntry } from '../types';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, BugAntIcon, CheckIcon, StopCircleIcon, SparklesIcon, HtmlIcon } from './icons';
import { CopyButton } from './CopyButton';

const LogEntryDetails = ({ data }: { data: object | null }) => {
    if (!data) return null;
    const jsonString = JSON.stringify(data, null, 2);
    return (
        <div className="relative mt-2">
            <pre className="text-xs p-3 bg-gray-100 dark:bg-black/40 rounded-md max-h-60 overflow-y-auto font-mono">
                {jsonString}
            </pre>
            <CopyButton textToCopy={jsonString} />
        </div>
    );
};

const LogEntry = ({ entry }: { entry: AILogEntry }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const getStatusInfo = () => {
        switch (entry.status) {
            case 'requesting':
                return {
                    icon: <SparklesIcon className="w-4 h-4 text-blue-500 animate-pulse" />,
                    color: 'text-blue-500 dark:text-blue-400',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/30'
                };
            case 'success':
                return {
                    icon: <CheckIcon className="w-4 h-4 text-green-500" />,
                    color: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-50 dark:bg-green-900/30'
                };
            case 'error':
                return {
                    icon: <StopCircleIcon className="w-4 h-4 text-red-500" />,
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-900/30'
                };
            default:
                return { icon: null, color: '', bgColor: '' };
        }
    };

    const { icon, color, bgColor } = getStatusInfo();

    return (
        <div className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700/80 ${bgColor}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <span title={entry.status}>{icon}</span>
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{entry.timestamp}</span>
                    <span className={`font-semibold text-sm ${color}`}>{entry.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${color}`}>{entry.status}</span>
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
                </div>
            </div>
            {isExpanded && (
                <div className="mt-3 pl-7 space-y-2 animate-fade-in text-gray-800 dark:text-gray-200">
                    <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2"><HtmlIcon className="w-4 h-4"/> Request</h4>
                        <LogEntryDetails data={entry.requestData} />
                    </div>
                    {entry.responseData && (
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600 dark:text-green-400"><CheckIcon className="w-4 h-4"/> Response</h4>
                            <LogEntryDetails data={entry.responseData} />
                        </div>
                    )}
                    {entry.errorData && (
                        <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600 dark:text-red-400"><StopCircleIcon className="w-4 h-4"/> Error</h4>
                            <LogEntryDetails data={entry.errorData} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const AILogViewer = ({ logs, isVisible, onToggle, onClear }: {
    logs: AILogEntry[];
    isVisible: boolean;
    onToggle: () => void;
    onClear: () => void;
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        // This is the static, invisible hover trigger area.
        // It has a small height to be hoverable at the bottom of the screen.
        <div
            className="fixed bottom-0 left-6 z-40 h-6 w-[220px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* This is the actual UI element that slides up and expands */}
            <div
                className={`
                    absolute bottom-0 left-0 flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-b-0 border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-xl
                    transition-all duration-300 ease-in-out
                    ${isVisible ? 'w-[500px] h-[450px]' : 'w-auto h-auto'}
                `}
                style={{
                    transform: isVisible || isHovered ? 'translateY(0)' : 'translateY(100%)',
                }}
            >
                <header
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={onToggle}
                >
                    <div className="flex items-center gap-3">
                        <BugAntIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Log</h3>
                        <span className="px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 dark:text-purple-200 dark:bg-purple-600/30 rounded-full">{logs.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         {isVisible && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Clear logs"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                        <div className="p-2 rounded-lg text-gray-500 dark:text-gray-400" title={isVisible ? 'Collapse' : 'Expand'}>
                            {isVisible ? <ChevronDownIcon className="w-6 h-6" /> : <ChevronUpIcon className="w-6 h-6" />}
                        </div>
                    </div>
                </header>
                
                {isVisible && (
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/80 overflow-y-auto p-4 animate-fade-in">
                        {logs.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <p>No AI interactions logged yet. Start generating content to see logs here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map(entry => <LogEntry key={entry.id} entry={entry} />)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};