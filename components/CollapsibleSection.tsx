import * as React from 'react';
import { ChevronDownIcon } from './icons';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const CollapsibleSection = ({ id, title, icon, children, isOpen, onToggle }: CollapsibleSectionProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 rounded-xl shadow-sm overflow-hidden">
        <h2 id={`section-header-${id}`} className="text-lg font-bold">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between w-full p-4 font-bold text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                aria-expanded={isOpen}
                aria-controls={`section-content-${id}`}
            >
                <span className="flex items-center gap-3">
                    <span className="text-purple-500">{icon}</span>
                    {title}
                </span>
                <ChevronDownIcon
                    className={`w-6 h-6 transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
        </h2>
        <div 
            id={`section-content-${id}`}
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
            <div className="overflow-hidden">
                <div className="p-6 pt-2">
                    {children}
                </div>
            </div>
        </div>
    </div>
  );
};