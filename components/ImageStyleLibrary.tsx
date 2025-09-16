import React from 'react';
import type { Style } from '../services/imageStyles';
import { MagnifyingGlassIcon, ListBulletIcon, GridIcon, ClipboardIcon, CheckIcon, PaintBrushIcon, ArrowUturnLeftIcon, CloseIcon, StarIcon } from './icons';

interface ImageStyleLibraryProps {
    styles: Style[];
    recommendedStyles: string[];
    recommendationsReady: boolean;
    onUpdatePrompt: (styleName: string, newPrompt: string) => void;
    onResetPrompt: (styleName: string) => void;
}

type ViewMode = 'grid' | 'list';

const StyleCard = ({ 
    style, 
    viewMode, 
    editingStyle,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onPromptChange,
    onReset,
    isRecommended,
}: { 
    style: Style; 
    viewMode: ViewMode; 
    editingStyle: { name: string; tempPrompt: string } | null;
    onStartEdit: (style: Style) => void;
    onCancelEdit: () => void;
    onSaveEdit: (styleName: string, newPrompt: string) => void;
    onPromptChange: (newPrompt: string) => void;
    onReset: (styleName: string) => void;
    isRecommended: boolean;
}) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCopied) return;

        navigator.clipboard.writeText(style.prompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    };
    
    const isEditing = editingStyle?.name === style.name;

    if (isEditing) {
        const colSpan = viewMode === 'grid' ? 'col-span-2' : 'col-span-1';
        return (
            <div className={`relative p-3 rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 ${colSpan}`}>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{style.name}</h4>
                <textarea
                    value={editingStyle.tempPrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={8}
                    className="w-full p-2 text-xs font-mono rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-purple-500"
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                    <button onClick={onCancelEdit} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={() => onSaveEdit(style.name, editingStyle.tempPrompt)} className="px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">Save</button>
                </div>
            </div>
        );
    }


    if (viewMode === 'list') {
        return (
             <div className={`relative flex items-center gap-4 p-2 rounded-lg border-2 transition-all ${isCopied ? 'border-green-500' : 'border-transparent'} ${isRecommended ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800/50'}`}>
                <img src={style.thumbnail} alt={style.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                        {isRecommended && <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" title="AI Recommended" />}
                        <span>{style.name}</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">{style.description}</p>
                     {style.isCustomized && (
                        <span className="mt-1 inline-block text-[10px] font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-600/20 px-1.5 py-0.5 rounded-full">Modified</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={handleCopy} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" title="Copy prompt">
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4 text-gray-500" />}
                    </button>
                    <button onClick={() => onStartEdit(style)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" title="Edit prompt">
                        <PaintBrushIcon className="w-4 h-4 text-gray-500" />
                    </button>
                     {style.isCustomized && (
                         <button onClick={() => onReset(style.name)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" title="Reset to default">
                            <ArrowUturnLeftIcon className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Grid View
    return (
        <div className="relative group aspect-square rounded-xl overflow-hidden shadow-md">
            <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            
            {isRecommended && (
                 <div className="absolute top-2 right-2 z-20 text-yellow-300 bg-black/50 p-1.5 rounded-full backdrop-blur-sm" title="AI Recommended">
                    <StarIcon className="w-5 h-5" />
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                <h4 className="font-bold text-white text-base drop-shadow-md">{style.name}</h4>
                <p className="text-xs text-gray-200 mt-1 line-clamp-2 drop-shadow-md">{style.description}</p>
                
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                    <button onClick={handleCopy} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30" title={isCopied ? "Copied!" : "Copy prompt"}>
                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onStartEdit(style)} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30" title="Edit prompt">
                        <PaintBrushIcon className="w-4 h-4" />
                    </button>
                    {style.isCustomized && (
                        <button onClick={() => onReset(style.name)} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30" title="Reset to default">
                           <ArrowUturnLeftIcon className="w-4 h-4" />
                       </button>
                   )}
                </div>
            </div>
            {style.isCustomized && (
                <span className="absolute bottom-2 left-2 z-20 text-[10px] font-bold text-yellow-800 bg-yellow-300 px-1.5 py-0.5 rounded-full group-hover:opacity-0 transition-opacity">MODIFIED</span>
            )}
        </div>
    );
};


export const ImageStyleLibrary = ({ styles, recommendedStyles, recommendationsReady, onUpdatePrompt, onResetPrompt }: ImageStyleLibraryProps) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
    const [editingStyle, setEditingStyle] = React.useState<{ name: string; tempPrompt: string } | null>(null);

    const categories = ['All', ...Array.from(new Set(styles.map(s => s.category)))];

    const sortedStyles = React.useMemo(() => {
        return styles.slice().sort((a, b) => {
            const aIsRec = recommendedStyles.includes(a.name);
            const bIsRec = recommendedStyles.includes(b.name);
            if (recommendationsReady) {
                if (aIsRec && !bIsRec) return -1;
                if (!aIsRec && bIsRec) return 1;
            }
            return 0;
        });
    }, [styles, recommendedStyles, recommendationsReady]);

    const filteredStyles = React.useMemo(() => {
        return sortedStyles.filter(style => {
            const matchesCategory = selectedCategory === 'All' || style.category === selectedCategory;
            const matchesSearch = searchTerm === '' || style.name.toLowerCase().includes(searchTerm.toLowerCase()) || style.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [sortedStyles, searchTerm, selectedCategory]);
    
    const viewButtonClass = (isActive: boolean) =>
        `p-1.5 rounded-md transition-colors ${
        isActive
            ? 'bg-white dark:bg-gray-900 text-purple-600 shadow'
            : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
        }`;

    const handleStartEdit = (style: Style) => {
        setEditingStyle({ name: style.name, tempPrompt: style.prompt });
    };
    const handleCancelEdit = () => {
        setEditingStyle(null);
    };
    const handleSaveEdit = (styleName: string, newPrompt: string) => {
        onUpdatePrompt(styleName, newPrompt);
        setEditingStyle(null);
    };
    const handlePromptChange = (newPrompt: string) => {
        if (editingStyle) {
            setEditingStyle({ ...editingStyle, tempPrompt: newPrompt });
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search styles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-2 pl-10 pr-3 text-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                </div>
                 <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0">
                    <button onClick={() => setViewMode('list')} className={viewButtonClass(viewMode === 'list')} title="List View">
                        <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={viewButtonClass(viewMode === 'grid')} title="Grid View">
                        <GridIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex space-x-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {recommendationsReady && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-green-600 dark:text-green-300 flex-shrink-0" />
                    <p><span className="font-bold">AI Recommended Styles</span> are highlighted and moved to the top of the list.</p>
                </div>
            )}
            
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {filteredStyles.map((style) => (
                    <StyleCard
                        key={style.name}
                        style={style}
                        viewMode={viewMode}
                        editingStyle={editingStyle}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        onSaveEdit={handleSaveEdit}
                        onPromptChange={handlePromptChange}
                        onReset={onResetPrompt}
                        isRecommended={recommendationsReady && recommendedStyles.includes(style.name)}
                    />
                ))}
            </div>
        </div>
    );
};
