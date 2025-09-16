import React from 'react';
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowUturnLeftIcon } from './icons';

interface ZoomControlProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const buttonClass = "p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-300/50 dark:bg-gray-900/50 hover:bg-gray-400/50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all";

export const ZoomControl = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset }: ZoomControlProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-gray-300 dark:border-gray-700">
      <button onClick={onZoomOut} className={buttonClass} aria-label="Zoom out">
        <MagnifyingGlassMinusIcon className="w-5 h-5" />
      </button>
      <button onClick={onZoomReset} className={`${buttonClass} flex items-center gap-1.5 px-3`} aria-label="Reset zoom">
        <ArrowUturnLeftIcon className="w-5 h-5" />
        <span className="text-sm font-semibold">{Math.round(zoomLevel * 100)}%</span>
      </button>
      <button onClick={onZoomIn} className={buttonClass} aria-label="Zoom in">
        <MagnifyingGlassPlusIcon className="w-5 h-5" />
      </button>
    </div>
  );
};