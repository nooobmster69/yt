import React from 'react';
import { CopyButton } from './CopyButton';
import type { CanvasElement, AILogEntry } from '../types';
import { ThumbnailEditor } from './ThumbnailEditor';
import { CloseIcon, AddObjectIcon, AddTextIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, SparklesIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon } from './icons';
import { generatePromptFromLayout } from '../services/postProcessingService';
import { styles, Style } from '../services/imageStyles';

interface ThumbnailBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPromptGenerated: (prompt: string) => void;
    initialElements: CanvasElement[];
    initialBackground: string;
    onSave: (elements: CanvasElement[], background: string) => void;
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    addAiLogEntry: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void;
}

const fontOptions = ['Impact', 'Anton', 'Bebas Neue', 'Oswald', 'Arial Black', 'Verdana'];

const EditorSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-semibold text-gray-800 dark:text-gray-200">
                {title}
                <ChevronDownIcon className={`w-5 h-5 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-3 space-y-3">{children}</div>}
        </div>
    );
};

const LabeledControl = ({ label, htmlFor, children }: { label: string, htmlFor: string, children: React.ReactNode }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);
const inputClass = "w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm";
const rangeClass = "w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500";
const colorInputClass = "w-full h-9 p-0.5 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-pointer";
const toggleClass = (checked: boolean) => `${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`;
const toggleKnobClass = (checked: boolean) => `${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`;


export const ThumbnailBuilderModal = ({
    isOpen,
    onClose,
    onPromptGenerated,
    initialElements,
    initialBackground,
    onSave,
    generationModel,
    addAiLogEntry,
}: ThumbnailBuilderModalProps) => {
    const [elements, setElements] = React.useState<CanvasElement[]>([]);
    const [background, setBackground] = React.useState('');
    const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null);
    const [editingElementId, setEditingElementId] = React.useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = React.useState<string>('');
    const [isLoadingPrompt, setIsLoadingPrompt] = React.useState(false);
    const [selectedStyle, setSelectedStyle] = React.useState<Style>(styles[0]);
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = React.useState(false);
    const styleDropdownRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        if (isOpen) {
            setElements(JSON.parse(JSON.stringify(initialElements)));
            setBackground(initialBackground);
            setSelectedElementId(null);
            setEditingElementId(null);
            setGeneratedPrompt('');
        }
    }, [isOpen, initialElements, initialBackground]);

    const selectedElement = React.useMemo(() => {
        return elements.find(el => el.id === selectedElementId);
    }, [elements, selectedElementId]);

    const handleAddElement = (type: 'text' | 'object') => {
        const newElement: CanvasElement = {
            id: `el_${Date.now()}`,
            type,
            x: 35, y: 40,
            width: 30, height: 20,
            content: type === 'text' ? 'New Text' : 'Main Subject',
            rotation: 0,
            zIndex: elements.length,
            // Text defaults
            fontSize: 40,
            fontFamily: 'Impact',
            fontWeight: 900,
            fontStyle: 'normal',
            lineHeight: 1.2,
            color: '#FFFFFF',
            textAlign: 'center',
            strokeWidth: 2,
            strokeColor: '#000000',
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.75)',
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            use3dEffect: false,
            depth3d: 5,
            angle3d: 45,
            color3d: '#333333',
            useGradient: false,
            gradientColor1: '#FFFFFF',
            gradientColor2: '#8B5CF6',
            gradientAngle: 90,
            backgroundColor: 'rgba(209, 213, 219, 0.5)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 2,
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        if (type === 'text') {
            setEditingElementId(newElement.id);
        } else {
            setEditingElementId(null);
        }
    };

    const handleDeleteSelectedElement = () => {
        if (!selectedElementId) return;
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        if (editingElementId === selectedElementId) {
            setEditingElementId(null);
        }
        setSelectedElementId(null);
    };

    const handleUpdateElement = (id: string, props: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
    };

    const handleUpdateSelectedElement = (props: Partial<Omit<CanvasElement, 'id'>>) => {
        if (!selectedElementId) return;
        handleUpdateElement(selectedElementId, props);
    };

    const handleMoveLayer = (direction: 'up' | 'down') => {
        if (!selectedElement) return;
        
        const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sorted.findIndex(el => el.id === selectedElement.id);
        
        if (direction === 'up' && currentIndex < sorted.length - 1) {
            [sorted[currentIndex].zIndex, sorted[currentIndex + 1].zIndex] = [sorted[currentIndex + 1].zIndex, sorted[currentIndex].zIndex];
        } else if (direction === 'down' && currentIndex > 0) {
            [sorted[currentIndex].zIndex, sorted[currentIndex - 1].zIndex] = [sorted[currentIndex - 1].zIndex, sorted[currentIndex].zIndex];
        }
        
        setElements(sorted);
    };

    const handleBringToFront = () => {
        if (!selectedElement) return;
        const maxZIndex = Math.max(...elements.map(el => el.zIndex));
        handleUpdateSelectedElement({ zIndex: maxZIndex + 1 });
    };

    const handleSendToBack = () => {
        if (!selectedElement) return;
        const minZIndex = Math.min(...elements.map(el => el.zIndex));
        handleUpdateSelectedElement({ zIndex: minZIndex - 1 });
    };
    
    const handleGeneratePrompt = async () => {
        setIsLoadingPrompt(true);
        setGeneratedPrompt('');
        try {
            const prompt = await generatePromptFromLayout(background, elements, generationModel, addAiLogEntry, selectedStyle.prompt);
            setGeneratedPrompt(prompt);
        } catch (error) {
            console.error(error);
            alert("Failed to generate prompt.");
        } finally {
            setIsLoadingPrompt(false);
        }
    };

    const handleSaveAndClose = () => {
        onSave(elements, background);
        onClose();
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
                setIsStyleDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    const ToggleButton = ({ children, isActive, onClick }: { children: React.ReactNode, isActive: boolean, onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`w-full py-1 text-xs font-bold rounded ${isActive ? 'bg-purple-500 text-white shadow-inner' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'}`}
        >
            {children}
        </button>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Thumbnail Builder</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
                    <div className="lg:col-span-2 flex flex-col items-center justify-center h-full">
                        <ThumbnailEditor
                            elements={elements}
                            selectedElementId={selectedElementId}
                            onSelect={setSelectedElementId}
                            onUpdate={handleUpdateElement}
                            editingElementId={editingElementId}
                            setEditingElementId={setEditingElementId}
                        />
                    </div>

                    <aside className="h-full flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                         <div>
                            <label className="font-semibold text-gray-800 dark:text-gray-200">Background Prompt</label>
                            <textarea value={background} onChange={e => setBackground(e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleAddElement('text')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"><AddTextIcon className="w-5 h-5"/> Add Text</button>
                            <button onClick={() => handleAddElement('object')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"><AddObjectIcon className="w-5 h-5"/> Add Object</button>
                        </div>

                        {selectedElement?.type === 'text' && (
                             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3">
                                <h3 className="font-bold text-lg">Text Editor</h3>
                                <EditorSection title="Content & Font">
                                    <LabeledControl label="Text Content" htmlFor="textContent"><input id="textContent" type="text" value={selectedElement.content} onChange={e => handleUpdateSelectedElement({ content: e.target.value })} className={inputClass} /></LabeledControl>
                                    <LabeledControl label="Font Family" htmlFor="fontFamily"><select id="fontFamily" value={selectedElement.fontFamily} onChange={e => handleUpdateSelectedElement({ fontFamily: e.target.value })} className={inputClass}>{fontOptions.map(f => <option key={f}>{f}</option>)}</select></LabeledControl>
                                    <div className="grid grid-cols-2 gap-4">
                                        <LabeledControl label="Font Size" htmlFor="fontSize"><input id="fontSize" type="number" value={selectedElement.fontSize} onChange={e => handleUpdateSelectedElement({ fontSize: Number(e.target.value) })} className={inputClass} /></LabeledControl>
                                        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200 dark:bg-gray-600 rounded-md self-end">
                                            <ToggleButton isActive={selectedElement.fontWeight === 900} onClick={() => handleUpdateSelectedElement({ fontWeight: selectedElement.fontWeight === 900 ? 400 : 900 })}>Bold</ToggleButton>
                                            <ToggleButton isActive={selectedElement.fontStyle === 'italic'} onClick={() => handleUpdateSelectedElement({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}>Italic</ToggleButton>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200 dark:bg-gray-600 rounded-md">
                                        <ToggleButton isActive={selectedElement.textAlign === 'left'} onClick={() => handleUpdateSelectedElement({ textAlign: 'left' })}>Left</ToggleButton>
                                        <ToggleButton isActive={selectedElement.textAlign === 'center'} onClick={() => handleUpdateSelectedElement({ textAlign: 'center' })}>Center</ToggleButton>
                                        <ToggleButton isActive={selectedElement.textAlign === 'right'} onClick={() => handleUpdateSelectedElement({ textAlign: 'right' })}>Right</ToggleButton>
                                    </div>
                                    <LabeledControl label={`Line Height: ${selectedElement.lineHeight.toFixed(1)}`} htmlFor="lineHeight">
                                        <input id="lineHeight" type="range" min="0.8" max="3" step="0.1" value={selectedElement.lineHeight} onChange={e => handleUpdateSelectedElement({ lineHeight: Number(e.target.value) })} className={rangeClass} />
                                    </LabeledControl>
                                </EditorSection>
                                <EditorSection title="Color & Fill">
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200 dark:bg-gray-600 rounded-md">
                                        <ToggleButton isActive={!selectedElement.useGradient} onClick={() => handleUpdateSelectedElement({ useGradient: false })}>Solid</ToggleButton>
                                        <ToggleButton isActive={selectedElement.useGradient} onClick={() => handleUpdateSelectedElement({ useGradient: true })}>Gradient</ToggleButton>
                                    </div>
                                    {selectedElement.useGradient ? (
                                        <div className="space-y-3 mt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <LabeledControl label="Color 1" htmlFor="gradientColor1"><input id="gradientColor1" type="color" value={selectedElement.gradientColor1} onChange={e => handleUpdateSelectedElement({ gradientColor1: e.target.value })} className={colorInputClass} /></LabeledControl>
                                                <LabeledControl label="Color 2" htmlFor="gradientColor2"><input id="gradientColor2" type="color" value={selectedElement.gradientColor2} onChange={e => handleUpdateSelectedElement({ gradientColor2: e.target.value })} className={colorInputClass} /></LabeledControl>
                                            </div>
                                            <LabeledControl label={`Angle: ${selectedElement.gradientAngle}°`} htmlFor="gradientAngle">
                                                <input id="gradientAngle" type="range" min="0" max="360" value={selectedElement.gradientAngle} onChange={e => handleUpdateSelectedElement({ gradientAngle: Number(e.target.value) })} className={rangeClass} />
                                            </LabeledControl>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <LabeledControl label="Color" htmlFor="fontColor"><input id="fontColor" type="color" value={selectedElement.color} onChange={e => handleUpdateSelectedElement({ color: e.target.value })} className={colorInputClass} /></LabeledControl>
                                        </div>
                                    )}
                                </EditorSection>
                                <EditorSection title="Stroke (Outline)">
                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <LabeledControl label="Stroke Width" htmlFor="strokeWidth"><input id="strokeWidth" type="range" min="0" max="15" step="0.5" value={selectedElement.strokeWidth} onChange={e => handleUpdateSelectedElement({ strokeWidth: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                        <LabeledControl label="Color" htmlFor="strokeColor"><input id="strokeColor" type="color" value={selectedElement.strokeColor} onChange={e => handleUpdateSelectedElement({ strokeColor: e.target.value })} className={colorInputClass} /></LabeledControl>
                                    </div>
                                </EditorSection>
                                <EditorSection title="Drop Shadow">
                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <LabeledControl label="Blur" htmlFor="shadowBlur"><input id="shadowBlur" type="range" min="0" max="50" value={selectedElement.shadowBlur} onChange={e => handleUpdateSelectedElement({ shadowBlur: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                        <LabeledControl label="Color" htmlFor="shadowColor"><input id="shadowColor" type="color" value={selectedElement.shadowColor} onChange={e => handleUpdateSelectedElement({ shadowColor: e.target.value })} className={colorInputClass} /></LabeledControl>
                                        <LabeledControl label="Offset X" htmlFor="shadowOffsetX"><input id="shadowOffsetX" type="range" min="-25" max="25" value={selectedElement.shadowOffsetX} onChange={e => handleUpdateSelectedElement({ shadowOffsetX: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                        <LabeledControl label="Offset Y" htmlFor="shadowOffsetY"><input id="shadowOffsetY" type="range" min="-25" max="25" value={selectedElement.shadowOffsetY} onChange={e => handleUpdateSelectedElement({ shadowOffsetY: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                    </div>
                                </EditorSection>
                                <EditorSection title="3D Effect">
                                    <LabeledControl label="Enable" htmlFor="use3dEffect">
                                        <button type="button" onClick={() => handleUpdateSelectedElement({ use3dEffect: !selectedElement.use3dEffect })} className={toggleClass(selectedElement.use3dEffect)}><span className={toggleKnobClass(selectedElement.use3dEffect)} /></button>
                                    </LabeledControl>
                                    <div className={`grid grid-cols-2 gap-4 items-end ${!selectedElement.use3dEffect && 'opacity-50 pointer-events-none'}`}>
                                        <LabeledControl label="Depth" htmlFor="depth3d"><input id="depth3d" type="range" min="0" max="20" value={selectedElement.depth3d} onChange={e => handleUpdateSelectedElement({ depth3d: Number(e.target.value) })} disabled={!selectedElement.use3dEffect} className={rangeClass} /></LabeledControl>
                                        <LabeledControl label="Angle" htmlFor="angle3d"><input id="angle3d" type="range" min="0" max="360" value={selectedElement.angle3d} onChange={e => handleUpdateSelectedElement({ angle3d: Number(e.target.value) })} disabled={!selectedElement.use3dEffect} className={rangeClass} /></LabeledControl>
                                        <LabeledControl label="Color" htmlFor="color3d"><input id="color3d" type="color" value={selectedElement.color3d} onChange={e => handleUpdateSelectedElement({ color3d: e.target.value })} disabled={!selectedElement.use3dEffect} className={colorInputClass} /></LabeledControl>
                                    </div>
                                </EditorSection>
                                 <EditorSection title="Transform & Layering" defaultOpen={false}>
                                    <LabeledControl label="Rotation" htmlFor="rotation"><input id="rotation" type="range" min="-180" max="180" value={selectedElement.rotation} onChange={e => handleUpdateSelectedElement({ rotation: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button onClick={handleSendToBack} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Send to Back"><ChevronDoubleDownIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleMoveLayer('down')} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Send Backward"><ChevronDownIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleMoveLayer('up')} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Bring Forward"><ChevronUpIcon className="w-5 h-5"/></button>
                                        <button onClick={handleBringToFront} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Bring to Front"><ChevronDoubleUpIcon className="w-5 h-5"/></button>
                                        <button onClick={handleDeleteSelectedElement} className="p-2 rounded-md bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 ml-auto hover:bg-red-300 dark:hover:bg-red-700/50" title="Delete Element"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </EditorSection>
                            </div>
                        )}
                        {selectedElement?.type === 'object' && (
                             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3">
                                <h3 className="font-bold text-lg">Object Editor</h3>
                                <EditorSection title="Content & Style">
                                    <LabeledControl label="Object Description" htmlFor="objectContent"><input id="objectContent" type="text" value={selectedElement.content} onChange={e => handleUpdateSelectedElement({ content: e.target.value })} className={inputClass} /></LabeledControl>
                                    <LabeledControl label="Background Color" htmlFor="bgColor"><input id="bgColor" type="color" value={selectedElement.backgroundColor} onChange={e => handleUpdateSelectedElement({ backgroundColor: e.target.value })} className={colorInputClass} /></LabeledControl>
                                    <div className="grid grid-cols-2 gap-4">
                                        <LabeledControl label="Border Color" htmlFor="borderColor"><input id="borderColor" type="color" value={selectedElement.borderColor} onChange={e => handleUpdateSelectedElement({ borderColor: e.target.value })} className={colorInputClass} /></LabeledControl>
                                        <LabeledControl label="Border Width" htmlFor="borderWidth"><input id="borderWidth" type="number" value={selectedElement.borderWidth} min="0" max="20" onChange={e => handleUpdateSelectedElement({ borderWidth: Number(e.target.value) })} className={inputClass} /></LabeledControl>
                                    </div>
                                </EditorSection>
                                 <EditorSection title="Transform & Layering" defaultOpen={false}>
                                     <LabeledControl label="Rotation" htmlFor="rotationObj"><input id="rotationObj" type="range" min="-180" max="180" value={selectedElement.rotation} onChange={e => handleUpdateSelectedElement({ rotation: Number(e.target.value) })} className={rangeClass} /></LabeledControl>
                                     <div className="flex items-center gap-2 mt-1">
                                        <button onClick={handleSendToBack} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Send to Back"><ChevronDoubleDownIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleMoveLayer('down')} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Send Backward"><ChevronDownIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleMoveLayer('up')} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Bring Forward"><ChevronUpIcon className="w-5 h-5"/></button>
                                        <button onClick={handleBringToFront} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" title="Bring to Front"><ChevronDoubleUpIcon className="w-5 h-5"/></button>
                                        <button onClick={handleDeleteSelectedElement} className="p-2 rounded-md bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 ml-auto hover:bg-red-300 dark:hover:bg-red-700/50" title="Delete Element"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </EditorSection>
                            </div>
                        )}
                        
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                             <label className="font-semibold text-gray-800 dark:text-gray-200">Art Style</label>
                             <div ref={styleDropdownRef} className="relative mt-1">
                                <button type="button" onClick={() => setIsStyleDropdownOpen(prev => !prev)} className="w-full flex items-center justify-between text-left p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                    <span className="flex items-center gap-2 text-sm">
                                        <img src={selectedStyle.thumbnail} alt={selectedStyle.name} className="w-8 h-8 object-cover rounded" />
                                        <span>{selectedStyle.name}</span>
                                    </span>
                                    <ChevronDownIcon className="w-5 h-5" />
                                </button>
                                {isStyleDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <ul>{styles.map(style => (<li key={style.name}><button type="button" onClick={() => { setSelectedStyle(style); setIsStyleDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"><img src={style.thumbnail} alt="" className="w-8 h-8 rounded"/>{style.name}</button></li>))}</ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={handleGeneratePrompt} disabled={isLoadingPrompt} className="w-full flex items-center justify-center gap-2 p-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-500">
                           {isLoadingPrompt ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"/> : <SparklesIcon className="w-5 h-5"/>}
                           {isLoadingPrompt ? 'Generating...' : 'Generate AI Prompt'}
                        </button>

                        {generatedPrompt && (
                            <div className="relative">
                                <textarea readOnly value={generatedPrompt} rows={5} className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm font-mono" />
                                <CopyButton textToCopy={generatedPrompt} />
                            </div>
                        )}
                    </aside>
                </main>
                
                <footer className="flex justify-end items-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">Cancel</button>
                    <button onClick={handleSaveAndClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 text-sm">Save Layout</button>
                    <button onClick={() => onPromptGenerated(generatedPrompt)} disabled={!generatedPrompt} className="px-4 py-2 font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-500 text-sm">Use This Prompt</button>
                </footer>
            </div>
        </div>
    );
};